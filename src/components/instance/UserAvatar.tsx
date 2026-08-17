import {useState} from "react";

import {cn} from "@uva-fnwi/datanose-ui";

const getInitials = (name: string): string => {
    return name
        .trim()
        .split(" ")
        .filter((word) => word.length > 0 && /^[a-zA-Z]/.test(word))
        .map((word) => word.charAt(0).toUpperCase() + ".")
        .join(" ");
};

interface UserAvatarProps {
    userName: string;
    picture?: string;
    size?: "small" | "large";
    className?: string;
}

export function UserAvatar({userName, picture, size = "large", className}: UserAvatarProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <div
            aria-hidden="true"
            className={cn(
                "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 align-middle font-medium text-gray-600",
                size === "small" ? "h-9 w-9 text-sm" : "mb-2 h-16 w-16",
                className,
            )}
        >
            {picture && (
                <img
                    src={picture}
                    alt={userName}
                    className={`h-full w-full object-cover ${!imageLoaded && "hidden"}`}
                    onLoad={() => setImageLoaded(true)}
                />
            )}
            {(!picture || !imageLoaded) && (
                <span className="w-full p-0 text-center leading-none whitespace-normal">
                    {getInitials(userName)}
                </span>
            )}
        </div>
    );
}
