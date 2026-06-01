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
}
export function UserAvatar({userName}: UserAvatarProps) {
    return (
        <div className="mb-2 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200 align-middle font-medium text-gray-600">
            <span className="w-full p-1 text-center">{getInitials(userName)}</span>
        </div>
    );
}
