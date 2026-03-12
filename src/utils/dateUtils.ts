/**
 * Parses a date string that can be in "DD-MM-YYYY HH:mm" or ISO format.
 * This centralized utility handles various date formats found in the application.
 *
 * @param dateString The date string to parse.
 * @returns A Date object. Returns an invalid Date if parsing fails.
 */
export const parseDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date(NaN);

  // Try parsing "DD-MM-YYYY HH:mm" or "DD-MM-YYYY HH:mm:ss"
  const dmyMatch = dateString.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (dmyMatch) {
    const [, day, month, year, hours, minutes, seconds] = dmyMatch;
    // Construct ISO-like string for reliable parsing
    return new Date(
      `${year}-${month}-${day}T${hours}:${minutes}:${seconds || "00"}`,
    );
  }

  // Fallback for ISO format or other standard formats that new Date() can handle.
  // The replace(" ", "T") helps with formats like "YYYY-MM-DD HH:mm:ss".
  return new Date(dateString.replace(" ", "T"));
};

// Helper to format Date to Sispro format: DD-MM-YYYY HH:mm
export const formatDateForSispro = (date: Date) => {
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};
