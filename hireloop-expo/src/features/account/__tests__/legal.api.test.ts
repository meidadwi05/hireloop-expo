import {mapLegalDocumentResponse} from '../api/legal.api';

describe('legal API mapper', () => {
  it('memetakan struktur dokumen legal dari endpoint publik backend', () => {
    const result = mapLegalDocumentResponse({
      success: true,
      data: [{
        id: 1,
        title: 'Kebijakan Privasi',
        desc: 'Penjelasan kebijakan.',
        content: ['Diperbarui 18 November 2026'],
        structure: 'header',
        updated_at: '2026-11-18T09:00:00+07:00',
      }],
    });

    expect(result[0]).toEqual({
      id: 1,
      title: 'Kebijakan Privasi',
      description: 'Penjelasan kebijakan.',
      content: ['Diperbarui 18 November 2026'],
      structure: 'header',
      updatedAt: '2026-11-18T09:00:00+07:00',
    });
  });
});
