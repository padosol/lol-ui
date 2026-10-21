"use client";

import { useState } from "react";
import { PostCard, useMyPosts } from "@/entities/community";
import MypagePostList from "./MypagePostList";

export default function MyPostsSection() {
  const [page, setPage] = useState(0);
  const query = useMyPosts(page);

  return (
    <MypagePostList
      namespace="mypage.posts"
      page={page}
      onPageChange={setPage}
      query={query}
      renderPost={(post) => <PostCard post={post} />}
    />
  );
}
