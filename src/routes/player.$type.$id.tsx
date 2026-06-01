import { createFileRoute } from "@tanstack/react-router";
import { Player } from "@/components/kino/Player";

export const Route = createFileRoute("/player/$type/$id")({ component: Player });
