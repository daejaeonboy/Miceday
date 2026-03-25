export type InstallationCaseBlockType = 'heading' | 'paragraph' | 'image';

export interface InstallationCaseContentBlock {
  id: string;
  type: InstallationCaseBlockType;
  text?: string;
  imageUrl?: string;
  caption?: string;
}

const LAYOUT_METADATA_PREFIX = '<!--HP_CASE_LAYOUT:';
const LEGACY_GALLERY_METADATA_PREFIX = '<!--HP_CASE_GALLERY:';
const METADATA_SUFFIX = '-->';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const layoutMetadataPattern = new RegExp(
  `${escapeRegExp(LAYOUT_METADATA_PREFIX)}([\\s\\S]*?)${escapeRegExp(METADATA_SUFFIX)}`,
);

const legacyGalleryMetadataPattern = new RegExp(
  `${escapeRegExp(LEGACY_GALLERY_METADATA_PREFIX)}([\\s\\S]*?)${escapeRegExp(METADATA_SUFFIX)}`,
);

const stripHtmlTags = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const createBlockId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeGalleryImages = (galleryImages: string[]) =>
  galleryImages
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);

const normalizeBlock = (block: Partial<InstallationCaseContentBlock> | null | undefined) => {
  if (!block || typeof block !== 'object') return null;

  const type = block.type;
  if (type !== 'heading' && type !== 'paragraph' && type !== 'image') return null;

  const normalized: InstallationCaseContentBlock = {
    id: typeof block.id === 'string' && block.id.trim() ? block.id : createBlockId(),
    type,
  };

  if (type === 'image') {
    const imageUrl = typeof block.imageUrl === 'string' ? block.imageUrl.trim() : '';
    if (!imageUrl) return null;
    normalized.imageUrl = imageUrl;
    normalized.caption = typeof block.caption === 'string' ? block.caption : '';
    return normalized;
  }

  const text = typeof block.text === 'string' ? block.text : '';
  if (!text.trim()) return null;
  normalized.text = text;
  return normalized;
};

const normalizeBlocks = (blocks: unknown) => {
  if (!Array.isArray(blocks)) return [] as InstallationCaseContentBlock[];
  return blocks
    .map((block) => normalizeBlock(block as Partial<InstallationCaseContentBlock>))
    .filter((block): block is InstallationCaseContentBlock => Boolean(block));
};

const parseLegacyGalleryImages = (content: string) => {
  const match = content.match(legacyGalleryMetadataPattern);
  if (!match) return [] as string[];

  try {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) {
      return normalizeGalleryImages(parsed.filter((item): item is string => typeof item === 'string'));
    }
  } catch (error) {
    console.warn('Failed to parse installation case gallery metadata:', error);
  }

  return [] as string[];
};

const createLegacyBlocks = (bodyContent: string, galleryImages: string[]) => {
  const blocks: InstallationCaseContentBlock[] = [];
  const plainText = stripHtmlTags(bodyContent);

  if (plainText) {
    blocks.push({
      id: createBlockId(),
      type: 'paragraph',
      text: plainText,
    });
  }

  galleryImages.forEach((imageUrl) => {
    blocks.push({
      id: createBlockId(),
      type: 'image',
      imageUrl,
      caption: '',
    });
  });

  return blocks;
};

export const createInstallationCaseBlock = (type: InstallationCaseBlockType = 'paragraph'): InstallationCaseContentBlock => {
  if (type === 'image') {
    return {
      id: createBlockId(),
      type,
      imageUrl: '',
      caption: '',
    };
  }

  return {
    id: createBlockId(),
    type,
    text: '',
  };
};

export const extractInstallationCaseContent = (content?: string | null) => {
  const rawContent = content ?? '';
  const layoutMatch = rawContent.match(layoutMetadataPattern);

  if (layoutMatch) {
    try {
      const parsed = JSON.parse(layoutMatch[1]);
      const blocks = normalizeBlocks(Array.isArray(parsed) ? parsed : parsed?.blocks);
      const bodyContent = rawContent.replace(layoutMatch[0], '').trim();
      const plainText = blocks
        .map((block) => (block.type === 'image' ? block.caption || '' : block.text || ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        bodyContent,
        galleryImages: [] as string[],
        blocks,
        plainText,
        usesBlocks: blocks.length > 0,
      };
    } catch (error) {
      console.warn('Failed to parse installation case layout metadata:', error);
    }
  }

  const galleryImages = parseLegacyGalleryImages(rawContent);
  const bodyContent = rawContent.replace(legacyGalleryMetadataPattern, '').trim();
  const blocks = createLegacyBlocks(bodyContent, galleryImages);

  return {
    bodyContent,
    galleryImages,
    blocks,
    plainText: stripHtmlTags(bodyContent),
    usesBlocks: false,
  };
};

export const buildInstallationCaseContentFromBlocks = (blocks: InstallationCaseContentBlock[]) => {
  const normalizedBlocks = normalizeBlocks(blocks);

  if (normalizedBlocks.length === 0) {
    return '';
  }

  return `${LAYOUT_METADATA_PREFIX}${JSON.stringify({ blocks: normalizedBlocks })}${METADATA_SUFFIX}`;
};

export const stripInstallationCaseMetadata = (content?: string | null) =>
  extractInstallationCaseContent(content).plainText;
