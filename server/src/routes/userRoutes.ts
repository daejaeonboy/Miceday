import express, { Request, Response } from 'express';
import { auth } from '../config/firebaseAdmin';

const router = express.Router();

const getBearerToken = (req: Request): string | null => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return null;
    }

    return header.slice('Bearer '.length).trim();
};

const getAuthenticatedUid = async (req: Request): Promise<string | null> => {
    const token = getBearerToken(req);
    if (!token) {
        return null;
    }

    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
};

// 사용자 이메일 변경
router.put('/update-email', async (req: Request, res: Response) => {
    try {
        const { firebaseUid, newEmail } = req.body;
        const authenticatedUid = await getAuthenticatedUid(req);

        if (!authenticatedUid) {
            res.status(401).json({ error: '인증이 필요합니다.' });
            return;
        }

        if (!firebaseUid || !newEmail) {
            res.status(400).json({ error: 'firebaseUid와 newEmail이 필요합니다.' });
            return;
        }

        if (authenticatedUid !== firebaseUid) {
            res.status(403).json({ error: '본인 계정만 변경할 수 있습니다.' });
            return;
        }

        // Firebase Auth에서 이메일 업데이트
        const userRecord = await auth.updateUser(firebaseUid, {
            email: newEmail
        });

        res.json({
            success: true,
            message: '이메일이 변경되었습니다.',
            user: {
                uid: userRecord.uid,
                email: userRecord.email
            }
        });
    } catch (error: any) {
        console.error('이메일 변경 실패:', error);
        res.status(500).json({ error: error.message || '이메일 변경에 실패했습니다.' });
    }
});

// 사용자 비밀번호 변경
router.put('/update-password', async (req: Request, res: Response) => {
    try {
        const { firebaseUid, newPassword } = req.body;
        const authenticatedUid = await getAuthenticatedUid(req);

        if (!authenticatedUid) {
            res.status(401).json({ error: '인증이 필요합니다.' });
            return;
        }

        if (!firebaseUid || !newPassword) {
            res.status(400).json({ error: 'firebaseUid와 newPassword가 필요합니다.' });
            return;
        }

        if (authenticatedUid !== firebaseUid) {
            res.status(403).json({ error: '본인 계정만 변경할 수 있습니다.' });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ error: '비밀번호는 최소 6자 이상이어야 합니다.' });
            return;
        }

        // Firebase Auth에서 비밀번호 업데이트
        await auth.updateUser(firebaseUid, {
            password: newPassword
        });

        res.json({
            success: true,
            message: '비밀번호가 변경되었습니다.'
        });
    } catch (error: any) {
        console.error('비밀번호 변경 실패:', error);
        res.status(500).json({ error: error.message || '비밀번호 변경에 실패했습니다.' });
    }
});

// 사용자 정보 조회 (Firebase UID로)
router.get('/:firebaseUid', async (req: Request, res: Response) => {
    try {
        const firebaseUid = req.params.firebaseUid as string;
        const authenticatedUid = await getAuthenticatedUid(req);

        if (!authenticatedUid) {
            res.status(401).json({ error: '인증이 필요합니다.' });
            return;
        }

        if (authenticatedUid !== firebaseUid) {
            res.status(403).json({ error: '본인 계정만 조회할 수 있습니다.' });
            return;
        }

        const userRecord = await auth.getUser(firebaseUid);

        res.json({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            disabled: userRecord.disabled,
            emailVerified: userRecord.emailVerified
        });
    } catch (error: any) {
        console.error('사용자 조회 실패:', error);
        res.status(500).json({ error: error.message || '사용자 조회에 실패했습니다.' });
    }
});

export default router;
