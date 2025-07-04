export function prefixSignature(message: string): string {
  return `snapthentic:v1:${message}`;
}

export function stripPrefix(signature: string): string {
  return signature.replace(/^snapthentic:v1:/, "");
}
