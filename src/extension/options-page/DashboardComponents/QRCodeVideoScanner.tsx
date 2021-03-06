import React, { useRef } from 'react'
import { hasWKWebkitRPCHandlers } from '../../../utils/iOS-RPC'
import { WKWebkitQRScanner } from '../../../components/shared/qrcode'
import { useQRCodeVideoScan } from '../../../utils/hooks/useQRCodeVideoScan'

export interface QRCodeVideoScannerProps {
    scanning: boolean
    deviceId?: string
    onScan?: (value: string) => void
    onError?: () => void
    onQuit?: () => void
    VideoProps?: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>
}

export function QRCodeVideoScanner({
    scanning,
    deviceId,
    onScan,
    onError,
    onQuit,
    VideoProps,
}: QRCodeVideoScannerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useQRCodeVideoScan(videoRef, scanning, deviceId, onScan, onError)
    return hasWKWebkitRPCHandlers ? (
        <WKWebkitQRScanner onScan={onScan} onQuit={onQuit} />
    ) : (
        <video style={{ minWidth: 404 }} ref={videoRef} {...VideoProps} />
    )
}
