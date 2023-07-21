import React from "react";

const getWidth = () => window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

export default function useCurrentWidth() {
    const [width, setWidth] = React.useState(getWidth());

    React.useEffect(() => {
        const onResize = () => {
            setWidth(getWidth());
        };

        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return width;
}