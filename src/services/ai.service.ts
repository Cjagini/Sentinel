import OpenAI from "openai";
import { ClassificationResult } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_CATEGORIES = ["Food", "Transport", "Utilities", "Entertainment", "Shopping"];

/**
 * AI Service for transaction classification
 * Uses OpenAI GPT-4o-mini model with system prompt to restrict categories
 */
export class AIService {
  /**
   * Classify a transaction description into predefined categories
   * @param description - Transaction description
   * @returns Classification result with category and confidence score
   */
  static async classifyTransaction(description: string): Promise<ClassificationResult> {
    try {
      // Validate input
      if (!description || description.trim().length === 0) {
        throw new Error("Description cannot be empty");
      }

      const systemPrompt = `You are a financial transaction classifier. Your job is to categorize transactions based on their descriptions.

You must classify transactions into EXACTLY ONE of these categories:
- Food: Groceries, restaurants, cafes, food delivery
- Transport: Gas, public transit, taxis, car maintenance, parking
- Utilities: Electricity, water, internet, phone bills
- Entertainment: Movies, games, sports, hobbies, streaming services
- Shopping: Clothing, electronics, household items, general shopping

Respond with ONLY a JSON object in this format (no markdown, no explanation):
{"category": "Category Name", "confidence": 0.95}

The confidence score should be between 0 and 1, where 1 is absolutely certain.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Classify this transaction: "${description}"`,
          },
        ],
        temperature: 0.3, // Low temperature for consistent results
        max_tokens: 50,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI API");
      }

      // Parse the JSON response
      const result = JSON.parse(content);

      // Validate the response structure
      if (
        !result.category ||
        !ALLOWED_CATEGORIES.includes(result.category) ||
        typeof result.confidence !== "number" ||
        result.confidence < 0 ||
        result.confidence > 1
      ) {
        console.warn("[AIService.classifyTransaction] Invalid response structure:", result);
        // Return a default classification if parsing fails
        return {
          category: "Shopping",
          confidence: 0.5,
        };
      }

      return result as ClassificationResult;
    } catch (error) {
      console.error("[AIService.classifyTransaction] Error:", error);
      // Return a safe default on error
      return {
        category: "Shopping",
        confidence: 0.5,
      };
    }
  }

  /**
   * Validate if a category is allowed
   * @param category - Category name
   * @returns True if category is allowed
   */
  static isValidCategory(category: string): boolean {
    return ALLOWED_CATEGORIES.includes(category);
  }

  /**
   * Get all allowed categories
   * @returns Array of allowed categories
   */
  static getAllowedCategories(): string[] {
    return ALLOWED_CATEGORIES;
  }
}
