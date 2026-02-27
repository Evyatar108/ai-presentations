/**
 * Types for the video timestamp bookmark system.
 *
 * Bookmarks are named timestamps within a video that can be seeked to
 * when a TTS marker fires during narrated playback.
 */

export interface VideoZoomRegion {
  cx: number;    // Normalized center x (0-1)
  cy: number;    // Normalized center y (0-1)
  scale: number; // Zoom factor (1=full, 2=2x, etc.)
}

export interface VideoBookmark {
  id: string;      // Referenced by VideoSeekTrigger.bookmarkId
  time: number;    // Seek target, seconds in the video
  label?: string;  // Human-readable description (editor only)
  zoom?: VideoZoomRegion; // Optional zoom region — VideoPlayer zooms to this area on seek
}

export interface VideoBookmarkSet {
  bookmarks: VideoBookmark[];
}

export interface VideoBookmarksFile {
  demoId: string;
  videos: Record<string, VideoBookmarkSet>; // keyed by video file path
}
