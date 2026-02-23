import DemoEditor from "./DemoEditor";

const DemoEditorPage = () => {
    return (
        <div className="space-y-6 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Lexical Demo Editor</h1>
                <p className="text-muted-foreground mt-2">Lexical 기반의 기본 리치 텍스트 에디터 데모입니다.</p>
            </div>
            <DemoEditor/>
        </div>
    );
};

export default DemoEditorPage;
