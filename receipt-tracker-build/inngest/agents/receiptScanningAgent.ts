import { anthropic, createAgent, createTool, openai } from "@inngest/agent-kit";
import { z } from "zod";

const parsePdfTool = createTool({
  name: "parse-pdf",
  description: "Analyzes the given PDF",
  parameters: z.object({
    pdfUrl: z.string(),
  }),
  handler: async ({ pdfUrl }, { step }) => {
    try {
      return await step?.ai.infer("parse-pdf", {
        model: anthropic({
          model: "claude-3-5-sonnet-latest",
          defaultParameters: {
            max_tokens: 3094,
          },
        }),

        body: {
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "url",
                    url: pdfUrl,
                  },
                },
                {
                  type: "text",
                  text: `Extract the data from the receipt and return the structured output as follows:
                                {
                                    "merchant": {
                                        "name": "Store Name",
                                        "address": "123 Main St, City, Country",
                                        "contact": "+123456789"
                                        },
                                        "transaction": {
                                            "date": "YYYY-MM-DD",
                                            "receipt_number": "ABC123456",
                                            "payment_method": "Credit Card"
                                            },
                                            "items": [
                                                {
                                                    "name": "Item 1",
                                                    "quantity": 2,
                                                    "unit_price": 10.00,
                                                    "total_price": 20.00
                                                    }
                                                    ],
                                                    "totals": {
                                                        "subtotal": 20.00,
                                                        "tax": 2.00,
                                                        "total": 22.00,
                                                        "currency": "USD"
                                                        },
                                                        },
                                                        `,
                },
              ],
            },
          ],
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error();
    }
  },
});

export const receiptScanningAgent = createAgent({
  name: "Receipt Scanning Agent",
  description:
    "Process receipt images and PDFs to extract key information such as vendor names, dates, amounts, and line items",
  system: `You are an AI-powered receipt scanning assistant. Your primary role is to accurately extract and structure relevant information from scanned receipts. Your task includes recognizing and parsing details such as: merchant information (store name, address, contact details), transaction details (date, time, receipt number, payment method), itemized purchases (product names, quantities, individual prices, discounts), total amounts (subtotal, taxes, total paid, and any applied discounts), ensure high accurarcy by detecting OCR errors and correcting misread text when possible, normalize dates, normalize currency values, normalize formatting for consistency. If any key details are missing or unclear, return a structured response indicating incomplete data. Handle multiple formats, languages, and varying receipt layouts efficiently. Maintain a structured JSON output for easy integration with databases or expense tracking systems.`,
  model: openai({
    model: "gpt-4o-mini",
    defaultParameters: {
      max_completion_tokens: 3094,
    },
  }),
  tools: [parsePdfTool],
});
