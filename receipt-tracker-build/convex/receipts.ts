import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a Convex upload URL for client
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Generate URL the client can use to upload file
    return await ctx.storage.generateUploadUrl();
  },
});

// Store a receipt file and add to the database
export const storeReceipt = mutation({
  args: {
    userId: v.string(),
    fileId: v.id("_storage"),
    fileName: v.string(),
    size: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    // Save receipt to database
    const receiptId = await ctx.db.insert("receipts", {
      userId: args.userId,
      fileName: args.fileName,
      fileId: args.fileId,
      uploadedAt: Date.now(),
      size: args.size,
      mimeType: args.mimeType,
      status: "pending",

      // Initialize extracted data fields as null
      merchantName: undefined,
      merchantAddress: undefined,
      merchantContact: undefined,
      transactionDate: undefined,
      transactionAmount: undefined,
      currency: undefined,
      items: [],
    });

    return receiptId;
  },
});

// Get all receipts
export const getReceipts = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Only return receipts for authenticated users
    return await ctx.db
      .query("receipts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// Get receipt by ID
export const getReceiptById = query({
  args: {
    id: v.id("receipts"),
  },
  handler: async (ctx, args) => {
    // Get the receipt
    const receipt = await ctx.db.get(args.id);

    // Verify user has access to this receipt
    if (receipt) {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error("Not authorized");
      }

      const userId = identity.subject;

      if (receipt.userId !== userId) {
        throw new Error("Not authorized to access this receipt");
      }
    }

    return receipt;
  },
});

// Generate a URL to download a receipt file
export const getReceiptDownloadUrl = query({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get temp URL that can be used to download the file
    return await ctx.storage.getUrl(args.fileId);
  },
});

// Update the status of a receipt
export const updateReceiptStatus = mutation({
  args: {
    id: v.id("receipts"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user should have access
    const receipt = await ctx.db.get(args.id);
    if (!receipt) {
      throw new Error("Receipt not found");
    }

    const indentify = await ctx.auth.getUserIdentity();
    if (!indentify) {
      throw new Error("Not authenticated");
    }

    const userId = indentify.subject;
    if (receipt.userId !== userId) {
      throw new Error("Not authorized to update this receipt");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
    });

    return true;
  },
});

// Delete a receipt and its file
export const deleteReceipt = mutation({
  args: {
    id: v.id("receipts"),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.id);

    if (!receipt) {
      throw new Error("Receipt not found");
    }

    // Verify user has access to this receipt
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    if (receipt.userId !== userId) {
      throw new Error("Not authorized to delete this receipt");
    }

    // Delete the file from storage
    await ctx.storage.delete(receipt.fileId);

    // Delete the receipt record
    await ctx.db.delete(args.id);

    return true;
  },
});

// Update a receipt with extracted data
export const updateReceiptWithExtractedData = mutation({
  args: {
    id: v.id("receipts"),
    fileDisplayName: v.string(),
    merchantName: v.string(),
    merchantAddress: v.string(),
    merchantContact: v.string(),
    transactionDate: v.string(),
    transactionAmount: v.string(),
    currency: v.string(),
    receiptSummary: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        totalPrice: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Verify the receipt exists
    const receipt = await ctx.db.get(args.id);
    if (!receipt) {
      throw new Error("Receipt not found");
    }

    // Update the receipt with the extracted data
    await ctx.db.patch(args.id, {
      fileDisplayName: args.fileDisplayName,
      merchantName: args.merchantName,
      merchantAddress: args.merchantAddress,
      merchantContact: args.merchantContact,
      transactionDate: args.transactionDate,
      transactionAmount: args.transactionAmount,
      currency: args.currency,
      receiptSummary: args.receiptSummary,
      items: args.items,
      status: "processed",
    });

    return {
      userId: receipt.userId,
    };
  },
});
