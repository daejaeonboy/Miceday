/**
 * Firebase Auth 에러 코드를 사용자 친화적인 한국어 메시지로 변환합니다.
 */
export const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return '이메일 또는 비밀번호가 올바르지 않습니다.';
        case 'auth/invalid-email':
            return '유효하지 않은 이메일 형식입니다.';
        case 'auth/user-disabled':
            return '비활성화된 계정입니다. 관리자에게 문의해주세요.';
        case 'auth/email-already-in-use':
            return '이미 사용 중인 이메일입니다.';
        case 'auth/weak-password':
            return '비밀번호가 너무 약합니다. 8자 이상으로 설정해주세요.';
        case 'auth/network-request-failed':
            return '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
        case 'auth/too-many-requests':
            return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        case 'auth/operation-not-allowed':
            return '현재 이 로그인 방식이 활성화되어 있지 않습니다.';
        case 'auth/requires-recent-login':
            return '보안을 위해 다시 로그인한 뒤 시도해주세요.';
        case 'auth/popup-closed-by-user':
            return 'Google 로그인 창이 닫혔습니다. 다시 시도해주세요.';
        case 'auth/cancelled-popup-request':
            return '이미 다른 로그인 창이 열려 있습니다. 잠시 후 다시 시도해주세요.';
        case 'auth/popup-blocked':
            return '브라우저가 팝업을 차단했습니다. 팝업 허용 후 다시 시도해주세요.';
        case 'auth/account-exists-with-different-credential':
            return '같은 이메일로 다른 로그인 방식이 이미 등록되어 있습니다.';
        case 'auth/unauthorized-domain':
            return '현재 도메인이 Firebase 인증 허용 도메인에 등록되어 있지 않습니다.';
        case 'auth/operation-not-supported-in-this-environment':
            return '현재 브라우저 환경에서는 이 로그인 방식이 지원되지 않습니다.';
        case 'auth/internal-error':
            return '인증 서버 처리 중 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
            return '인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
};
