import React from "react";
import {
    Box,
    Button,
    Fade,
    Paper,
    Stack,
    Step,
    StepConnector,
    stepConnectorClasses,
    StepContent,
    StepLabel,
    Stepper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import useCurrentWidth from "../../hooks/useCurrentWidth";
import StepSecretDrop from "./StepSecretDrop";
import StepShardingConfiguration from "./StepShardingConfiguration";
import StepShardsDownload from "./StepShardsDownload";

const ColoredConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
}));

export default function SplitSecretPanel(): JSX.Element {
    const [loaded, setLoaded] = React.useState<boolean>(false);
    const currentWidth = useCurrentWidth();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerOffsetTop, setContainerOffsetTop] = React.useState<number>(0);

    const [activeStep, setActiveStep] = React.useState(0);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    React.useEffect(() => {
        if (containerRef && containerRef.current) {
            setContainerOffsetTop(containerRef.current.offsetTop + 24);
            setLoaded(true);
        }
    }, [containerRef, currentWidth]);

    const [steps,] = React.useState<string[]>(["Drop your secret", "Configure sharding", "Download your shards"]);
    const [panels,] = React.useState<JSX.Element[]>([
        StepSecretDrop(),
        StepShardingConfiguration(),
        StepShardsDownload(),
    ]);

    return (
        <>
            <Stack sx={{ display: { xs: "none", sm: "inherit" } }} width={"100%"} spacing={"12px"}>
                <Stepper
                    sx={{
                        marginTop: "24px",
                    }}
                    activeStep={activeStep}
                    alternativeLabel={true}
                    connector={<ColoredConnector />}
                >

                    {steps.map((label, index) => {
                        const stepProps: { completed?: boolean } = {};
                        const labelProps: {
                        optional?: React.ReactNode;
                    } = {};
                        return (
                            <Step key={index} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}

                </Stepper>

                <Fade in={true} style={{ transitionDelay: "200ms" }}>
                    <div
                        ref={containerRef}
                        style={{
                            marginTop: "24px",
                            width: "100%",
                            height: `calc(100vh - ${containerOffsetTop}px)`,
                            overflow: "scroll"
                        }}
                    >
                        {loaded &&
                        <Paper sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            <div style={{ display: "flex", flex: 1, overflow: "scroll" }}>
                                {panels[activeStep]}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", margin: "12px" }}>
                                {activeStep === steps.length - 1 ? (
                                    <div style={{display: "flex", width: "100%", justifyContent: "flex-end"}}>
                                        <Button onClick={handleReset}>Reset</Button>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            color="inherit"
                                            disabled={activeStep === 0}
                                            onClick={handleBack}
                                            sx={{ mr: 1 }}
                                        >
                                                Back
                                        </Button>
                                        <Button onClick={handleNext}>
                                            {activeStep === steps.length - 2 ? "Finish" : "Next"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Paper>
                        }
                    </div>
                </Fade>
            </Stack>
            <Box sx={{ display: { xs: "flex", sm: "none" }, width: "100%" }}>
                <Fade in={true} style={{ transitionDelay: "200ms" }}>
                    <Box sx={{ marginTop: "12px", width: "100%" }}>
                        <Stepper
                            activeStep={activeStep}
                            orientation="vertical"
                            connector={<ColoredConnector />}
                        >
                            {steps.map((step, index) => (
                                <Step key={index}>
                                    <StepLabel>
                                        {step}
                                    </StepLabel>
                                    <StepContent>
                                        <Box>
                                            <Stack spacing={"12px"}>
                                                <Fade in={true} style={{ transitionDelay: "200ms" }}>
                                                    <Paper sx={{ padding: "12px" }}>
                                                        {panels[activeStep]}
                                                    </Paper>
                                                </Fade>
                                                <Stack direction={"row"} display={"flex"} justifyContent={"space-between"}>
                                                    {activeStep === steps.length - 1 ? (
                                                        <div style={{display: "flex", width: "100%"}}>
                                                            <Button variant={"contained"} onClick={handleReset}>
                                                                Reset
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Button variant={"contained"} onClick={handleNext}>
                                                                {activeStep === steps.length - 2 ? "Finish" : "Next"}
                                                            </Button>
                                                            <Button
                                                                color="inherit"
                                                                disabled={activeStep === 0}
                                                                onClick={handleBack}
                                                                sx={{ mr: 1 }}
                                                            >
                                                                Back
                                                            </Button>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                </Fade>
            </Box>
        </>
    );
}
