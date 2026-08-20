import { useMutation } from "@tanstack/react-query";
import { uploadPostImage, deletePostImage } from "../api/imageApi";

/**
 * 캐시를 무효화하지 않는다. 업로드된 이미지는 아직 어떤 글에도 속하지 않아
 * 무효화할 쿼리가 없고, 글에 붙는 시점은 글 저장 뮤테이션이 따로 처리한다.
 */
export function useUploadPostImage() {
  return useMutation({
    mutationFn: (file: File) => uploadPostImage(file),
  });
}

export function useDeletePostImage() {
  return useMutation({
    mutationFn: (imageId: number) => deletePostImage(imageId),
  });
}
