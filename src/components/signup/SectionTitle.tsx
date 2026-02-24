type SectionTitleProps = {
    title: string;
    required?: boolean;
    hint?: string;
};

const SectionTitle = ({title, required, hint}: SectionTitleProps) => {
    return (
        <div className="flex items-center justify-between border-b pb-2">
            <p className="text-2xl font-bold">{title}</p>
            {required ? <p className="text-sm text-destructive">{hint}</p> : null}
        </div>
    );
};

export {SectionTitle};
