import { supabase } from "./supabase";
import ePub from "epubjs";

// Add custom type extensions for epubjs
declare module "epubjs" {
  interface PackagingMetadataObject {
    title: string;
    creator: string | string[];
    description?: string;
    publisher?: string;
    subject?: string | string[];
    date?: string;
    rights?: string;
    language?: string;
    cover?: string;
    [key: string]: any;
  }
  
  interface PackagingManifestItem {
    href?: string;
    id?: string;
    media_type?: string;
    properties?: string[];
    [key: string]: any;
  }
}

// Define interfaces for book processing
interface ChapterInfo {
  id: string;
  href: string;
  title: string;
  order: number;
  content?: string;
}

// Main book processing function
export async function processBook(
  bookId: string,
  fileUrl: string,
  fileType: string
): Promise<boolean> {
  try {
    console.log(`Starting processing for book ${bookId} with file type ${fileType}`);
    
    // Process based on file type
    if (fileType.toLowerCase() === "epub") {
      return await processEpub(bookId, fileUrl);
    } else if (fileType.toLowerCase() === "pdf") {
      return await processPdf(bookId, fileUrl);
    } else {
      // Mark as processed with basic metadata for other formats
      const { error } = await supabase
        .from("books")
        .update({
          processed: true,
          title: "Unknown Format Book",
          author: "Unknown",
          description: "This book format is not supported for full processing.",
        })
        .eq("id", bookId);

      return !error;
    }
  } catch (error) {
    console.error("Error processing book:", error);
    return false;
  }
}

// Process EPUB files
async function processEpub(bookId: string, fileUrl: string): Promise<boolean> {
  try {
    // Clean the URL - ensure we're getting the file correctly
    const cleanFileUrl = fileUrl.replace(/\s/g, '%20');
    console.log("Accessing EPUB at URL:", cleanFileUrl);
    
    // First check if the file is accessible
    try {
      const response = await fetch(cleanFileUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.error(`EPUB file is not accessible: ${response.status} ${response.statusText}`);
        throw new Error(`File not accessible: ${response.status} ${response.statusText}`);
      }
      console.log("EPUB file is accessible, proceeding with parsing");
    } catch (fetchError: any) {
      console.error("Error checking EPUB file accessibility:", fetchError);
      throw new Error(`EPUB file access error: ${fetchError.message}`);
    }
    
    // Create book object
    const book = ePub(cleanFileUrl);
    
    // Add error handler
    book.on('openFailed', (error: any) => {
      console.error("EPUB open failed:", error);
    });
    
    console.log("Waiting for EPUB to be ready...");
    await book.ready;
    console.log("EPUB is ready, extracting metadata");

    // Extract metadata
    const metadata = await book.loaded.metadata;
    const title = metadata.title || "Unknown Title";
    // Handle creator field which might be a string or array
    const creator = metadata.creator;
    const author = Array.isArray(creator) 
      ? creator.join(", ") 
      : (typeof creator === "string" ? creator : "Unknown Author");
    
    // Get description with fallbacks
    let description = "";
    if (typeof metadata.description === "string" && metadata.description.trim()) {
      description = metadata.description;
    } else if (metadata.subject) {
      // If no description, use subject/category as a fallback
      description = Array.isArray(metadata.subject)
        ? `Categories: ${metadata.subject.join(", ")}`
        : `Category: ${metadata.subject}`;
    }
    
    // If still no description, create one from available metadata
    if (!description) {
      const publisher = metadata.publisher ? `Published by ${metadata.publisher}. ` : "";
      const date = metadata.date ? `Published on ${metadata.date}. ` : "";
      const rights = metadata.rights ? `${metadata.rights}` : "";
      description = `${publisher}${date}${rights}`.trim() || "No description available.";
    }
    
    console.log("Extracted metadata:", { title, author, description: description.substring(0, 50) + "..." });
    
    // Get cover URL if available
    let coverUrl = "";
    try {
      // Try multiple methods to find cover
      // 1. Check for cover in manifest
      coverUrl = book.packaging?.manifest?.["cover"]?.href || "";
      
      // 2. If no direct cover reference, check for cover image ID
      if (!coverUrl) {
        const coverId = book.packaging?.metadata?.cover;
        if (coverId && book.packaging?.manifest?.[coverId]) {
          coverUrl = book.packaging.manifest[coverId].href || "";
        }
      }
      
      // 3. If still no cover, look for an item with "cover" in the ID or href
      if (!coverUrl) {
        const manifestItems = book.packaging?.manifest || {};
        for (const key in manifestItems) {
          const item = manifestItems[key];
          if (
            (key.toLowerCase().includes("cover") || 
             (item.href && item.href.toLowerCase().includes("cover"))) &&
            (item.media_type && item.media_type.startsWith("image/"))
          ) {
            coverUrl = item.href;
            break;
          }
        }
      }
      
      // Make the URL absolute if it's relative
      if (coverUrl && !coverUrl.startsWith("http")) {
        try {
          // First try with URL constructor
          const baseUrl = new URL(cleanFileUrl);
          const basePath = baseUrl.pathname.split('/').slice(0, -1).join('/');
          const absoluteUrl = new URL(coverUrl, `${baseUrl.origin}${basePath}/`);
          coverUrl = absoluteUrl.toString();
        } catch (urlError) {
          // Fallback for simple path joining
          const fileUrlParts = cleanFileUrl.split('/');
          fileUrlParts.pop(); // Remove filename
          const baseUrl = fileUrlParts.join('/');
          coverUrl = `${baseUrl}/${coverUrl.replace(/^\//, '')}`;
        }
      }
      
      console.log("Extracted cover URL:", coverUrl);
    } catch (e) {
      console.log("Could not extract cover:", e);
    }

    // Get chapters
    const chapters: ChapterInfo[] = [];
    const nav = await book.loaded.navigation;
    
    // @ts-ignore - epubjs typing issue
    const spineItems = book.spine?.items || [];
    
    // 1. First try to get chapters from table of contents
    if (nav.toc && nav.toc.length > 0) {
      console.log(`Found ${nav.toc.length} chapters in TOC`);
      for (let i = 0; i < nav.toc.length; i++) {
        const item = nav.toc[i];
        const id = item.id || `chapter-${i}`;
        const href = item.href || "";
        const title = item.label || `Chapter ${i + 1}`;

        chapters.push({
          id,
          href,
          title,
          order: i,
        });
      }
    } 
    
    // 2. If TOC is empty or has very few items, fallback to spine items
    if (chapters.length <= 1 && spineItems.length > 0) {
      console.log(`TOC has ${chapters.length} items, falling back to ${spineItems.length} spine items`);
      // Clear existing chapters if we're switching to spine
      chapters.length = 0;
      
      for (let i = 0; i < spineItems.length; i++) {
        // @ts-ignore - epubjs typing issue
        const item = spineItems[i];
        
        // Skip items that are likely not content (CSS, cover, etc.)
        // @ts-ignore
        const href = item.href || "";
        // @ts-ignore
        const idref = item.idref || "";
        
        if (
          href.endsWith(".css") || 
          href.endsWith(".xhtml") && (
            href.includes("cover") || 
            href.includes("title") ||
            href.includes("copy")
          )
        ) {
          continue;
        }
        
        chapters.push({
          // @ts-ignore - epubjs typing issue
          id: idref || `chapter-${i}`,
          href,
          title: `Chapter ${i + 1}`,
          order: i,
        });
      }
    }
    
    console.log(`Total chapters to process: ${chapters.length}`);
    
    // Ensure we have at least one chapter
    if (chapters.length === 0) {
      console.log("No chapters found in TOC or spine, creating default chapter");
      chapters.push({
        id: "chapter-1",
        href: "",
        title: "Book Content",
        order: 0,
      });
    }

    // Save chapter content
    for (const chapter of chapters) {
      // @ts-ignore - epubjs typing issue
      const section = book.spine.get(chapter.href);
      let content = "";
      
      if (section) {
        try {
          // Get the content as HTML
          // @ts-ignore - epubjs typing issue
          const html = await section.load();
          // @ts-ignore - epubjs typing issue
          content = html ? html.documentElement?.outerHTML || "" : "";
        } catch (err) {
          console.error(`Error loading content for chapter ${chapter.id}:`, err);
          content = "";
        }
      }

      // Insert chapter into database
      const { error } = await supabase.from("chapters").insert({
        book_id: bookId,
        title: chapter.title,
        content: content,
        order_index: chapter.order,
        href: chapter.href,
      });

      if (error) {
        console.error(`Error inserting chapter ${chapter.title}:`, error);
      }
    }

    // Update book metadata in database
    const { error } = await supabase
      .from("books")
      .update({
        processed: true,
        title,
        author,
        description,
        cover_url: coverUrl || null,
        total_chapters: chapters.length,
      })
      .eq("id", bookId);

    return !error;
  } catch (error) {
    console.error("Error processing EPUB:", error);
    
    // Mark as failed but processed
    await supabase
      .from("books")
      .update({
        processed: true,
        processing_error: true,
        title: "Error Processing EPUB",
      })
      .eq("id", bookId);
      
    return false;
  }
}

// Process PDF files - basic version
async function processPdf(bookId: string, fileUrl: string): Promise<boolean> {
  try {
    // For now, we'll just mark it as processed without extracting content
    // PDF parsing would require additional libraries
    const { error } = await supabase
      .from("books")
      .update({
        processed: true,
        title: "PDF Document",
        author: "Unknown",
        description: "PDF content (view in PDF reader)",
        total_chapters: 1,
      })
      .eq("id", bookId);

    // Create a single chapter entry that points to the PDF
    await supabase.from("chapters").insert({
      book_id: bookId,
      title: "PDF Content",
      content: `<div class="pdf-container"><a href="${fileUrl}" target="_blank">View PDF</a></div>`,
      order_index: 0,
    });

    return !error;
  } catch (error) {
    console.error("Error processing PDF:", error);
    return false;
  }
}