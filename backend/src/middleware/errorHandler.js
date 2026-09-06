export function notFoundHandler(req, res) {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;

  if (err.message && err.message.startsWith("Origin not allowed")) {
    return res.status(403).json({ message: err.message });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed.",
      issues: err.flatten ? err.flatten() : err.issues,
    });
  }

  if (err.name === "SyntaxError" && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Malformed JSON payload in request." });
  }

  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }

  if (statusCode >= 500) {
    console.error("Unhandled server error:", err);
  }

  return res.status(statusCode).json({
    message: statusCode >= 500 ? "An unexpected server error occurred." : err.message,
  });
}
