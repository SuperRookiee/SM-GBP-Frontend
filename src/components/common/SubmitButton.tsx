import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button.tsx";

interface SubmitButtonProps {
    pendingText: string;
    submitText: string;
}

const SubmitButton = ({ pendingText, submitText }: SubmitButtonProps) => {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? pendingText : submitText}
        </Button>
    );
};

export default SubmitButton;