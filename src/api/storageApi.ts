import { supabase } from '../lib/supabase';

const BUCKET_CANDIDATES = [
    import.meta.env.VITE_SUPABASE_BUCKET,
    'Humanpartner',
    'HumanPartner',
    'humanpartner',
    'human-partner',
    'products',
    'public',
    'uploads',
]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim());

const uniqueBuckets = Array.from(new Set(BUCKET_CANDIDATES));

const buildFilePath = (file: File, folder: string) => {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'png';
    const fileName = `${timestamp}_${Math.random().toString(36).slice(2, 8)}.${extension}`;
    return `${folder}/${fileName}`;
};

const isBucketNotFoundError = (error: any) => {
    const message = `${error?.message || ''} ${error?.error || ''} ${error?.details || ''}`.toLowerCase();
    return message.includes('bucket') && message.includes('not found');
};

const getErrorText = (error: any) =>
    error?.message || error?.error_description || error?.details || 'Unknown error';

export const uploadImage = async (file: File, folder: string = 'products'): Promise<string> => {
    const filePath = buildFilePath(file, folder);
    const errors: string[] = [];

    for (const bucket of uniqueBuckets) {
        const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

        if (error) {
            errors.push(`${bucket}: ${getErrorText(error)}`);
            continue;
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return urlData.publicUrl;
    }

    throw new Error(
        `Image upload failed. Tried buckets [${uniqueBuckets.join(', ')}]. Errors: ${errors.join(' | ')}`,
    );
};

const parseBucketAndPathFromUrl = (imageUrl: string): { bucket: string; path: string } | null => {
    try {
        const url = new URL(imageUrl);
        const parts = url.pathname.split('/').filter(Boolean);
        // Expected pattern: /storage/v1/object/public/<bucket>/<path...>
        const publicIndex = parts.indexOf('public');
        if (publicIndex === -1 || parts.length <= publicIndex + 2) return null;
        const bucket = parts[publicIndex + 1];
        const path = parts.slice(publicIndex + 2).join('/');
        if (!bucket || !path) return null;
        return { bucket, path };
    } catch {
        return null;
    }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
    const parsed = parseBucketAndPathFromUrl(imageUrl);
    const bucketsToTry = parsed
        ? [parsed.bucket, ...uniqueBuckets.filter((bucket) => bucket !== parsed.bucket)]
        : uniqueBuckets;

    let lastError: any = null;
    const filePath = parsed?.path;

    if (!filePath) return;

    for (const bucket of bucketsToTry) {
        const { error } = await supabase.storage.from(bucket).remove([filePath]);
        if (!error) return;
        lastError = error;
    }

    if (lastError) {
        throw lastError;
    }
};
