import { NextRequest } from "next/server";
import { AlertService } from "@/services/alert.service";
import { successResponse, errorResponse, toHttpResponse } from "@/lib/api-response";

/**
 * PATCH /api/alert-rules/[id]
 * Update an alert rule
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Allow partial updates: threshold and/or isActive
    const { threshold, isActive } = body;

    if (threshold === undefined && isActive === undefined) {
      const response = errorResponse(
        "At least one field must be provided: threshold or isActive",
        400
      );
      return toHttpResponse(response);
    }

    // Validate threshold if provided
    if (threshold !== undefined && (typeof threshold !== "number" || threshold <= 0)) {
      const response = errorResponse("Threshold must be a positive number", 400);
      return toHttpResponse(response);
    }

    // Build update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (threshold !== undefined) updateData.threshold = threshold;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedAlertRule = await AlertService.updateAlertRule(id, updateData);

    const response = successResponse(updatedAlertRule, 200, "Alert rule updated successfully");
    return toHttpResponse(response);
  } catch (error) {
    console.error("[PATCH /api/alert-rules/[id]] Error:", error);
    const response = errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
    return toHttpResponse(response);
  }
}

/**
 * DELETE /api/alert-rules/[id]
 * Delete an alert rule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deletedAlertRule = await AlertService.deleteAlertRule(id);

    const response = successResponse(deletedAlertRule, 200, "Alert rule deleted successfully");
    return toHttpResponse(response);
  } catch (error) {
    console.error("[DELETE /api/alert-rules/[id]] Error:", error);
    const response = errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
    return toHttpResponse(response);
  }
}
