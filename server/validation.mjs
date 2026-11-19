export function fail(status, code, message, fields) {
  throw Object.assign(new Error(message), { status, code, fields });
}
export function object(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(400, 'INVALID_BODY', '请提交JSON对象');
  if (Object.keys(value).some((k) => !keys.includes(k)))
    fail(400, 'UNKNOWN_FIELD', '请求包含不支持的字段');
  return value;
}
export function text(value, field, max) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    Array.from(value.trim()).length > max
  )
    fail(400, 'VALIDATION_ERROR', '请检查填写内容', {
      [field]: `请输入1至${max}个字符`,
    });
  return value.trim();
}
export function category(value) {
  if (!['support', 'billing', 'other'].includes(value))
    fail(400, 'VALIDATION_ERROR', '分类不正确', { category: '请选择有效分类' });
  return value;
}
export function positive(value, fallback, max = 100000) {
  if (value === null || value === undefined) return fallback;
  if (!/^\d+$/.test(String(value)) || Number(value) < 1 || Number(value) > max)
    fail(400, 'INVALID_QUERY', '分页条件不正确');
  return Number(value);
}
export async function body(request) {
  let size = 0,
    chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size <= 16384) chunks.push(chunk);
  }
  if (size > 16384) fail(413, 'BODY_TOO_LARGE', '请求内容过大');
  if (!request.headers['content-type']?.includes('application/json'))
    fail(415, 'JSON_REQUIRED', '请使用application/json');
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    fail(400, 'INVALID_JSON', 'JSON格式不正确');
  }
}
