import { supabase } from '../lib/supabase';
import { createNotification } from './notificationApi';

export interface Inquiry {
    id?: string;
    user_id: string;
    user_name?: string;
    user_email?: string;
    company_name?: string;
    category?: string;
    title: string;
    content: string;
    status?: 'pending' | 'answered';
    answer?: string;
    created_at?: string;
    answered_at?: string;
}

const TABLE_NAME = 'inquiries';
const USER_PROFILES_TABLE = 'user_profiles';
const ADMIN_BOOKINGS_LINK = '/admin/bookings';
export const QUOTE_INQUIRY_CATEGORY = '견적문의';

export const isInquiriesTableMissingError = (error: unknown): boolean => {
    const code = String((error as { code?: string } | null)?.code || '');
    const message = String((error as { message?: string } | null)?.message || '');

    return code === 'PGRST205' && message.includes(`'public.${TABLE_NAME}'`);
};

export interface QuoteInquiryPayload {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    neededProducts: string[];
    rentalStart?: string;
    rentalEnd?: string;
    quantity?: string;
    budget?: string;
    location?: string;
    preferredInstallTime?: string;
    preferredPickupTime?: string;
    preferredInstallPickupTime?: string;
    paymentMethod?: string;
    notes: string;
}

interface QuoteInquiryEnvelope {
    type: 'quote_request_v1';
    payload: QuoteInquiryPayload;
}

const toQuoteInquiryContent = (payload: QuoteInquiryPayload): string => {
    const envelope: QuoteInquiryEnvelope = {
        type: 'quote_request_v1',
        payload,
    };

    return JSON.stringify(envelope);
};

export const parseQuoteInquiryContent = (content: string): QuoteInquiryPayload | null => {
    try {
        const parsed = JSON.parse(content) as Partial<QuoteInquiryEnvelope>;
        if (parsed?.type !== 'quote_request_v1' || !parsed.payload) return null;
        return parsed.payload;
    } catch {
        return null;
    }
};

const getAdminUserIds = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from(USER_PROFILES_TABLE)
        .select('firebase_uid')
        .eq('is_admin', true);

    if (error) throw error;

    return (data || [])
        .map((item) => item.firebase_uid)
        .filter((firebaseUid): firebaseUid is string => Boolean(firebaseUid));
};

const notifyAdminsOfQuoteInquiry = async (payload: QuoteInquiryPayload) => {
    const adminUserIds = await getAdminUserIds();
    if (adminUserIds.length === 0) return;

    const title = '새 견적문의가 접수되었습니다.';
    const message = `${payload.companyName} / ${payload.contactName}`;

    await Promise.allSettled(
        adminUserIds.map((userId) =>
            createNotification(userId, title, message, 'info', ADMIN_BOOKINGS_LINK),
        ),
    );
};

export const getMyInquiries = async (userId: string): Promise<Inquiry[]> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const addInquiry = async (
    inquiry: Omit<Inquiry, 'id' | 'created_at' | 'status' | 'answer' | 'answered_at'>,
): Promise<string> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([inquiry])
        .select()
        .single();

    if (error) throw error;
    return data.id;
};

export const getAllInquiries = async (): Promise<Inquiry[]> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const answerInquiry = async (id: string, answer: string): Promise<void> => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .update({
            answer,
            status: 'answered',
            answered_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) throw error;
};

export const deleteInquiry = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const createQuoteInquiry = async (
    payload: QuoteInquiryPayload,
    requester?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
    },
): Promise<string> => {
    const safeUserId = requester?.userId || `guest-${Date.now()}`;
    const title = `[견적문의] ${payload.companyName} / ${payload.contactName}`;

    const inquiryId = await addInquiry({
        user_id: safeUserId,
        user_name: requester?.userName || payload.contactName,
        user_email: requester?.userEmail || payload.email,
        company_name: payload.companyName,
        category: QUOTE_INQUIRY_CATEGORY,
        title,
        content: toQuoteInquiryContent(payload),
    });

    try {
        await notifyAdminsOfQuoteInquiry(payload);
    } catch (error) {
        console.error('Failed to create admin notifications for quote inquiry:', error);
    }

    return inquiryId;
};

export const getQuoteInquiries = async (): Promise<Inquiry[]> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('category', QUOTE_INQUIRY_CATEGORY)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};
