/** True when the request body is declared larger than `max` bytes (or not declared on a body-carrying request). */
export function bodyTooLarge(req: Request, max: number) {
  const len = req.headers.get("content-length");
  if (len === null) return req.headers.get("transfer-encoding") === "chunked"; // streamed bodies: refuse
  return Number(len) > max;
}
