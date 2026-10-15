import {
  LightboxOverlay,
  DownloadButton,
  CloseButton,
} from '@reelkit/react-lightbox';

<LightboxOverlay
  showDownload
  renderControls={({ isDownloading, onDownload, onClose }) => (
    <>
      {onDownload && (
        <DownloadButton isDownloading={isDownloading} onClick={onDownload} />
      )}
      <CloseButton onClick={onClose} />
    </>
  )}
  {...props}
/>;
