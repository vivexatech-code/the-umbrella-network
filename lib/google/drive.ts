import "server-only";

import { google } from "googleapis";
import { extractDriveFolderId } from "@/lib/content/format";
import { googleAuth, googleClientEmail } from "@/lib/google/auth";

async function shareFolder(folderId: string, email: string) {
  const auth = googleAuth(["https://www.googleapis.com/auth/drive"]);
  if (!auth) throw new Error("Google Drive is not configured.");
  const drive = google.drive({ version: "v3", auth });
  await drive.permissions.create({
    fileId: folderId,
    supportsAllDrives: true,
    sendNotificationEmail: true,
    requestBody: {
      type: "user",
      role: "reader",
      emailAddress: email,
    },
  });
}

export async function grantDriveAccess(email: string, folderId: string) {
  const fallback = extractDriveFolderId(process.env.GOOGLE_DRIVE_RESOURCES_URL || "");
  const folderIds = [...new Set([folderId, fallback].map((value) => value.trim()).filter(Boolean))];
  if (folderIds.length === 0) throw new Error("This batch does not have a Google Drive folder.");

  let lastError = "Drive access failed.";
  for (const id of folderIds) {
    try {
      await shareFolder(id, email);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Drive access failed.";
      if (/already has access|duplicate/i.test(message)) return;
      lastError = message;
    }
  }

  const account = googleClientEmail();
  throw new Error(
    `${lastError}${account ? ` Share the Drive folder with ${account} as Editor, then retry.` : ""}`,
  );
}
