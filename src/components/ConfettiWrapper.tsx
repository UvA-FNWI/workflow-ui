import {Confetti} from "@datanose/ui";

import {selectIsActive, setConfettiActive} from "~/store/confettiSlice";
import {useAppSelector} from "~/store/store";

function ConfettiWrapper() {
    const isConfettiActive = useAppSelector(selectIsActive);

    return <Confetti isActive={isConfettiActive} onComplete={() => setConfettiActive(false)} />;
}

export default ConfettiWrapper;
