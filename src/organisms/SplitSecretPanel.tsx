import React from "react";
import {
    Button,
    Fade,
    Paper,
    Stack,
    Step,
    StepConnector,
    stepConnectorClasses,
    StepLabel,
    Stepper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import useCurrentWidth from "../hooks/useCurrentWidth";

const steps = ["Drop your secret", "Configure sharding", "Download your shards"];

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


    return (
        <Stack width={"100%"} spacing={"12px"}>
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
                            <div style={{ display: "flex", flex: 1, overflow: "scroll" }} />
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
    );
}
