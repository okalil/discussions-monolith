import { use } from "react";

import type { ParticipantsDto } from "~/core/discussion";

import { Avatar } from "~/web/ui/shared/avatar";

interface ParticipantsProps {
  participants: Promise<ParticipantsDto>;
}

export function Participants({ participants }: ParticipantsProps) {
  const resolvedParticipants = use(participants);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Participants</h2>
      <div className="flex flex-wrap gap-2">
        {resolvedParticipants.map((participant) => (
          <Avatar
            key={participant.id}
            src={participant.image}
            alt={participant.name || ""}
            size={40}
          />
        ))}
      </div>
    </div>
  );
} 