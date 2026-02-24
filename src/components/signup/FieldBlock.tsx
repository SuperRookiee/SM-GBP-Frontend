import {type ReactNode} from "react";

type FieldBlockProps = {
    label: string;
    required?: boolean;
    errors?: string[];
    children: ReactNode;
};

const FieldBlock = ({label, required, errors = [], children}: FieldBlockProps) => {
    return (
        <div className="rounded-md border">
            <div className="grid gap-0 md:grid-cols-[170px_1fr]">
                <div className="flex items-center bg-muted px-4 py-3 text-sm font-semibold">
                    {label} {required ? "*" : ""}
                </div>
                <div className="space-y-1 px-3 py-2">
                    {children}
                    {errors.map((error, index) => (
                        <p key={`${error}-${index}`} className="text-sm text-destructive">{error}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export {FieldBlock};
