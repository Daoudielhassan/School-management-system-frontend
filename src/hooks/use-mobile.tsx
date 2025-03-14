import { useEffect, useState } from "react";

/**
 * Custom hook to check if the user is on a mobile device.
 * It uses a combination of window.innerWidth for responsiveness
 * and user-agent checking for general mobile detection.
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Function to detect if the device is mobile
        const checkIsMobile = () => {
            // Option 1: Use screen width (e.g., less than 768px for mobile screens)
            const isScreenMobile = window.innerWidth <= 768;
            setIsMobile(isScreenMobile);
        };

        // Initial check for mobile devices
        checkIsMobile();

        // Re-check on window resize
        window.addEventListener("resize", checkIsMobile);
        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
    }, []);

    return isMobile;
}