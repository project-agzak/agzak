// src/components/organisms/GiftSuccessModal.tsx
import successModalBg from '@/assets/ui/letter-envelope.webp';
import { Button_M } from '@/components/atoms/Button_M';
import { Dialog, DialogContent } from '@/components/ui/Dialog';

type SuccessModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SuccessModal({ open, onClose }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="
          p-0
          bg-transparent border-none
          overflow-visible
          flex items-center justify-center
        "
      >
        <div className="relative w-[320px]">
          <img
            src={successModalBg}
            alt=""
            className="
              block
              w-[320px]
              h-auto
              pointer-events-none
              select-none
            "
          />
          <div
            className="
              absolute inset-0
              flex flex-col
              items-center justify-center
              pt-6 pb-8 px-8
            "
          >
            <div className="text-center space-y-6">
              <h3 className="text-lg font-galmuri-small font-bold text-gray-800 flex flex-col items-center pt-4 pl-2">
                전송되었습니다!
              </h3>

              <div className="pt-2">
                <Button_M label="확인" onClick={onClose} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
