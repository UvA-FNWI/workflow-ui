import {Confetti} from "@datanose/ui";

import {selectShowConfetti, setShowConfetti} from "~/store/effectsSlice";
import {useAppSelector} from "~/store/store";

function EffectsWrapper() {
    const showConfetti = useAppSelector(selectShowConfetti);

    return <Confetti isActive={!!showConfetti} onComplete={() => setShowConfetti(false)} />;
}

export default EffectsWrapper;
