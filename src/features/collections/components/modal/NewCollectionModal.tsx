import { InlineNewCollectionForm } from "@/features/collections/components/InlineNewCollectionForm";
import { useModal } from "@/components/providers/ModalProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NewCollectionModal() {
  const { closeModal } = useModal();
  const router = useRouter();

  return (
    <InlineNewCollectionForm
      onSuccess={(response) => {
        toast.success("Collection created! (Demo — showing feed)");
        closeModal();
        router.push("/collection");
      }}
      onError={(err) => {
        toast.error(err.message);
      }}
      isAlwaysOpen={true}
    />
  );
}
