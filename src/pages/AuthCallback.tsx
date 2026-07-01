import {useEffect, useRef} from "react";

import {useNavigate} from "react-router";

import {useAuth} from "@uva-fnwi/datanose-core";
import type {CustomUserState} from "@uva-fnwi/datanose-core";

function AuthCallback() {
    const {surfCompleteLogin} = useAuth();
    const navigate = useNavigate();
    // The login code is single-use. StrictMode runs this effect twice in dev, and
    // redeeming the code twice makes SURFconext drop the session and bounce you into
    // a login loop, so only redeem it once.
    const hasStartedLogin = useRef(false);

    useEffect(() => {
        if (hasStartedLogin.current) return;
        hasStartedLogin.current = true;

        surfCompleteLogin()
            .then((user) => {
                const state = user.state as CustomUserState;
                navigate(state?.redirectUrl ?? "/", {replace: true});
            })
            .catch(() => {
                navigate("/", {replace: true});
            });
    }, [surfCompleteLogin, navigate]);

    return null;
}

export default AuthCallback;
