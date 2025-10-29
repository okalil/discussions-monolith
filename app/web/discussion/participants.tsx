import { use } from "react";

import type { ParticipantsDto } from "../../core/discussion";

import { Avatar } from "../shared/avatar";

interface ParticipantsProps {
  participants: Promise<ParticipantsDto>;
}

export function Participants(props: ParticipantsProps) {
  const participants = use(props.participants);
  return (
    <div className="flex flex-wrap gap-1">
      {participants.map((participant) => (
        <Avatar
          key={participant.id}
          src={participant.image}
          alt={`${participant.name}'s avatar`}
          fallback={participant.name?.at(0)}
          size={24}
        />
      ))}
    </div>
  );
}
