import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const DemoTypography = () => {
    return (
        <div className="p-8 space-y-8">
            <Card className="p-8 space-y-6">
                <div>
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
                        Typography
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        shadcn/ui + Tailwind 기반 타이포그래피 예제 페이지입니다.
                    </p>
                </div>

                <Separator/>

                {/* Headings */}
                <div className="space-y-4">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
                        h1. Heading
                    </h1>
                    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
                        h2. Heading
                    </h2>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        h3. Heading
                    </h3>
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                        h4. Heading
                    </h4>
                </div>

                <Separator/>

                {/* Paragraph */}
                <div className="space-y-4">
                    <p className="leading-7">
                        이것은 기본 paragraph 스타일입니다. Tailwind의{" "}
                        <span className="font-medium">leading-7</span> 을 사용하여 가독성을
                        확보합니다.
                    </p>

                    <p className="leading-7 text-muted-foreground">
                        muted 스타일은 보조 설명 텍스트에 사용됩니다.
                    </p>

                    <p className="text-lg text-muted-foreground">
                        Lead 텍스트는 강조가 필요한 도입부에 사용됩니다.
                    </p>
                </div>

                <Separator/>

                {/* Inline elements */}
                <div className="space-y-4">
                    <p>
                        Inline <code className="bg-muted px-1.5 py-0.5 rounded text-sm">code</code> 스타일 예시입니다.
                    </p>

                    <blockquote className="mt-6 border-l-2 pl-6 italic">
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed di
                    </blockquote>
                </div>

                <Separator/>

                {/* Lists */}
                <div className="space-y-4">
                    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                        <li>Bullet List Item 1</li>
                        <li>Bullet List Item 2</li>
                        <li>Bullet List Item 3</li>
                    </ul>

                    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
                        <li>Ordered List Item 1</li>
                        <li>Ordered List Item 2</li>
                        <li>Ordered List Item 3</li>
                    </ol>
                </div>
            </Card>
        </div>
    );
};

export default DemoTypography;