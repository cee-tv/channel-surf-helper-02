import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List } from "lucide-react";

interface ChannelControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onShowChannels: () => void;
  channelName: string;
}

export const ChannelControls = ({
  onPrevious,
  onNext,
  onShowChannels,
  channelName,
}: ChannelControlsProps) => {
  return (
    <>
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-lg animate-fade-in">
        <span className="text-white font-medium">{channelName}</span>
      </div>

      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-40 flex justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/60 hover:bg-black/80 text-white"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/60 hover:bg-black/80 text-white"
          onClick={onNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      <div className="absolute bottom-4 right-4 z-40">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/60 hover:bg-black/80 text-white"
          onClick={onShowChannels}
        >
          <List className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};