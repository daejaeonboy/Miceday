import type { User } from 'firebase/auth';
import {
    createUserProfile,
    getUserProfileByFirebaseUid,
    hasAnyAdminUsers,
    updateUserProfile,
    type CreateUserProfileInput,
    type UserProfile,
} from '../api/userApi';

const DEFAULT_COMPANY_NAME = 'Human Partner';
const DEFAULT_BOOTSTRAP_ADMIN_EMAILS = ['micepartner@micepartner.co.kr'];

const getBootstrapAdminEmails = () => {
    const configuredEmails = (import.meta.env.VITE_ADMIN_BOOTSTRAP_EMAILS || import.meta.env.VITE_ADMIN_EMAIL_ALLOWLIST || '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

    return [...new Set([...DEFAULT_BOOTSTRAP_ADMIN_EMAILS, ...configuredEmails])];
};

const getDefaultProfileInput = (user: User): CreateUserProfileInput => ({
    firebase_uid: user.uid,
    email: user.email || '',
    name: user.displayName?.trim() || user.email?.split('@')[0] || 'Admin',
    phone: user.phoneNumber || '',
    company_name: DEFAULT_COMPANY_NAME,
    is_admin: true,
    is_approved: true,
    agreed_terms: true,
    agreed_privacy: true,
    agreed_marketing: false,
});

export const getBootstrapAdminProfileSnapshot = (user: User): UserProfile => ({
    ...getDefaultProfileInput(user),
    id: `bootstrap-${user.uid}`,
});

export const isBootstrapAdminEmail = (email?: string | null) => {
    if (!email) {
        return false;
    }

    return getBootstrapAdminEmails().includes(email.trim().toLowerCase());
};

export const shouldBootstrapAdmin = async (email?: string | null) => {
    const bootstrapEmails = getBootstrapAdminEmails();

    if (bootstrapEmails.length > 0) {
        return isBootstrapAdminEmail(email);
    }

    if (isBootstrapAdminEmail(email)) {
        return true;
    }

    if (!import.meta.env.DEV) {
        return false;
    }

    return !(await hasAnyAdminUsers());
};

export const ensureBootstrapAdminProfile = async (user: User): Promise<UserProfile | null> => {
    const existingProfile = await getUserProfileByFirebaseUid(user.uid);
    const canBootstrap = await shouldBootstrapAdmin(user.email);

    if (!canBootstrap) {
        return existingProfile;
    }

    if (!existingProfile) {
        try {
            return await createUserProfile(getDefaultProfileInput(user));
        } catch (error) {
            console.error('Failed to create bootstrap admin profile, using local fallback profile:', error);
            return getBootstrapAdminProfileSnapshot(user);
        }
    }

    const updates: Partial<UserProfile> = {};

    if (!existingProfile.is_admin) {
        updates.is_admin = true;
    }

    if (!existingProfile.is_approved) {
        updates.is_approved = true;
    }

    if (!existingProfile.email && user.email) {
        updates.email = user.email;
    }

    if (!existingProfile.name) {
        updates.name = user.displayName?.trim() || user.email?.split('@')[0] || 'Admin';
    }

    if (!existingProfile.phone && user.phoneNumber) {
        updates.phone = user.phoneNumber;
    }

    if (!existingProfile.company_name) {
        updates.company_name = DEFAULT_COMPANY_NAME;
    }

    if (!existingProfile.agreed_terms) {
        updates.agreed_terms = true;
    }

    if (!existingProfile.agreed_privacy) {
        updates.agreed_privacy = true;
    }

    if (existingProfile.agreed_marketing === undefined) {
        updates.agreed_marketing = false;
    }

    if (!existingProfile.id || Object.keys(updates).length === 0) {
        return existingProfile;
    }

    try {
        return await updateUserProfile(existingProfile.id, updates);
    } catch (error) {
        console.error('Failed to update bootstrap admin profile, using merged fallback profile:', error);
        return {
            ...existingProfile,
            ...updates,
        };
    }
};
