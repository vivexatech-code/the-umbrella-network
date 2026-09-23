import "server-only";

import { google } from "googleapis";
import { googleAuth } from "@/lib/google/auth";

export async function grantDriveAccess(email: string, folderId: string) {
  if (!folderId) throw new Error("This batch does not have a Google Drive folder.");
  const auth = googleAuth(["https://www.googleapis.com/auth/drive"]);
  if (!auth) throw new Error("Google Drive is not configured.");
  const drive = google.drive({ version: "v3", auth });
  try {
    await drive.permissions.create({
      fileId: folderId,
      supportsAllDrives: true,
      sendNotificationEmail: false,
      requestBody: {
        type: "user",
        role: "reader",
        emailAddress: email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Drive access failed.";
    if (/already has access|duplicate/i.test(message)) return;
    throw new Error(message);
  }
}
