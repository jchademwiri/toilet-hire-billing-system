import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the server-pdf module before importing the route
const mockGenerateBillingPdf = vi.fn();
vi.mock('@/engine/pdf/server-pdf', () => ({
  generateBillingPdf: mockGenerateBillingPdf,
}));

// Import after mocking
const { GET } = await import('@/app/api/billing/pdf/[type]/[id]/route');

function mockRequest(url: string): Request {
  return new Request(url);
}

async function callGet(type: string, id: string) {
  const request = mockRequest(`http://localhost/api/billing/pdf/${type}/${id}`);
  const params = Promise.resolve({ type, id });
  return GET(request, { params } as any);
}

describe('GET /api/billing/pdf/[type]/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('returns 400 for unsupported PDF type', async () => {
      const response = await callGet('quote', 'inv-006');
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('Unsupported PDF type');
    });

    it('returns 404 when document is not found', async () => {
      mockGenerateBillingPdf.mockResolvedValue(null);

      const response = await callGet('invoice', 'unknown');
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error).toBe('Document not found.');
    });

    it('calls generateBillingPdf with correct params', async () => {
      mockGenerateBillingPdf.mockResolvedValue({
        fileName: 'test.pdf',
        buffer: Buffer.from('mock-pdf-content'),
      });

      await callGet('invoice', 'inv-006');

      expect(mockGenerateBillingPdf).toHaveBeenCalledWith('invoice', 'inv-006');
    });
  });

  describe('successful response', () => {
    const mockFileName = 'Invoice-STP-INV-26-0396.pdf';
    const mockBuffer = Buffer.from('%PDF-1.4 mock pdf content for testing');

    beforeEach(() => {
      mockGenerateBillingPdf.mockResolvedValue({
        fileName: mockFileName,
        buffer: mockBuffer,
      });
    });

    it('returns 200 status', async () => {
      const response = await callGet('invoice', 'inv-006');
      expect(response.status).toBe(200);
    });

    it('sets Content-Type to application/pdf', async () => {
      const response = await callGet('invoice', 'inv-006');
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
    });

    it('sets Content-Disposition with attachment and filename', async () => {
      const response = await callGet('invoice', 'inv-006');
      expect(response.headers.get('Content-Disposition')).toBe(
        `attachment; filename="${mockFileName}"`,
      );
    });

    it('sets Cache-Control to no-store', async () => {
      const response = await callGet('invoice', 'inv-006');
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it('returns the PDF buffer as response body', async () => {
      const response = await callGet('invoice', 'inv-006');
      const body = await response.arrayBuffer();
      const bodyBuffer = Buffer.from(body);
      expect(bodyBuffer.equals(mockBuffer)).toBe(true);
    });

    it('PDF response starts with PDF magic bytes', async () => {
      const response = await callGet('invoice', 'inv-006');
      const body = await response.arrayBuffer();
      const header = new Uint8Array(body, 0, 4);
      expect(new TextDecoder().decode(header)).toBe('%PDF');
    });
  });
});
