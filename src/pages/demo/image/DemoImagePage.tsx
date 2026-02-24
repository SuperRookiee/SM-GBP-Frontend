import {useCallback, useState} from "react";
import Cropper, {type Area} from "react-easy-crop";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";

const DEFAULT_IMAGE = "https://valentinh.github.io/react-easy-crop/static/dog-26b9422dccf83dc4e809f679c0f2b78e.jpeg";
const CROPPED_SIZE = 720;

// #. 이미지 URL을 HTMLImageElement로 로드한다.
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

const getRadianAngle = (degreeValue: number) => (degreeValue * Math.PI) / 180;

// #. 회전 후 캔버스 경계 박스 크기를 계산한다.
const rotateSize = (width: number, height: number, rotation: number) => ({
    width: Math.abs(Math.cos(rotation) * width) + Math.abs(Math.sin(rotation) * height),
    height: Math.abs(Math.sin(rotation) * width) + Math.abs(Math.cos(rotation) * height),
});

// #. 선택한 영역을 720x720 이미지로 잘라 DataURL로 반환한다.
const getCroppedImage = async (imageSrc: string, pixelCrop: Area, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context is not available.");

    const rotRad = getRadianAngle(rotation);
    const {width: bBoxWidth, height: bBoxHeight} = rotateSize(image.width, image.height, rotRad);

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");
    if (!croppedCtx) throw new Error("Cropped canvas context is not available.");

    croppedCanvas.width = CROPPED_SIZE;
    croppedCanvas.height = CROPPED_SIZE;
    croppedCtx.imageSmoothingQuality = "high";
    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        CROPPED_SIZE,
        CROPPED_SIZE,
    );

    return croppedCanvas.toDataURL("image/jpeg");
};

const DemoImagePage = () => {
    const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [previewImage, setPreviewImage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState("");

    // #. 크롭 완료 시 픽셀 기준 좌표/크기를 저장한다.
    const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    // #. 로컬 파일을 읽어 크롭 대상 이미지로 설정한다.
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMessage("");
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setImageSrc(reader.result);
                setPreviewImage("");
                setZoom(1);
                setRotation(0);
                setCrop({x: 0, y: 0});
            }
        };
        reader.onerror = () => setErrorMessage("이미지 파일을 읽는 중 오류가 발생했습니다.");
        reader.readAsDataURL(file);
    };

    // #. 현재 크롭 영역으로 결과 미리보기를 생성한다.
    const onCreatePreview = async () => {
        if (!croppedAreaPixels) return;
        try {
            const croppedImage = await getCroppedImage(imageSrc, croppedAreaPixels, rotation);
            setPreviewImage(croppedImage);
            setErrorMessage("");
        } catch {
            setErrorMessage("크롭 미리보기 생성에 실패했습니다.");
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>react-easy-crop Demo</CardTitle>
                    <CardDescription>이미지를 업로드하고 드래그/줌/회전 후 크롭 결과를 확인합니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 파일 업로드/줌/회전 컨트롤 영역 */}
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="demo-image-upload">이미지 업로드</Label>
                            <Input id="demo-image-upload" type="file" accept="image/*" onChange={onFileChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="demo-image-zoom">줌 ({zoom.toFixed(2)})</Label>
                            <input
                                id="demo-image-zoom"
                                type="range"
                                min={1}
                                max={3}
                                step={0.01}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="demo-image-rotation">회전 ({rotation}°)</Label>
                            <input
                                id="demo-image-rotation"
                                type="range"
                                min={0}
                                max={360}
                                step={1}
                                value={rotation}
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* 실시간 크롭 캔버스 영역 */}
                    <div className="relative h-[420px] w-full overflow-hidden rounded-md border bg-black/80">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={onCropComplete}
                        />
                    </div>

                    {/* 크롭 결과 생성 액션 */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onCreatePreview}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                        >
                            크롭 결과 보기
                        </button>
                        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
                    </div>
                </CardContent>
            </Card>

            {previewImage ? (
                <Card>
                    <CardHeader>
                        <CardTitle>크롭 결과</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* 생성된 720x720 크롭 결과 미리보기 */}
                        <img src={previewImage} alt="Cropped preview" width={720} height={720}
                             className="h-[720px] w-[720px] rounded-md border object-cover"/>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
};

export default DemoImagePage;
