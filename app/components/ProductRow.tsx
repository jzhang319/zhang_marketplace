import Link from "next/link";
import { LoadingProductCard, ProductCard } from "./ProductCard";
import prisma from "../lib/db";
import { link } from "fs";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface productProps {
  category: "newest" | "templates" | "uikits" | "icons";
}

async function getData({ category }: productProps) {
  switch (category) {
    case "newest": {
      const data = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          smallDescription: true,
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      });

      return {
        data: data,
        title: "Newest Products",
        link: "/products/all",
      };
    }
    case "icons": {
      const data = await prisma.product.findMany({
        where: {
          category: "icon",
        },
        select: {
          id: true,
          name: true,
          price: true,
          smallDescription: true,
          images: true,
        },
        take: 3,
      });
      return {
        data: data,
        title: "Icons",
        link: "/products/icon",
      };
    }
    case "templates": {
      const data = await prisma.product.findMany({
        where: {
          category: "template",
        },
        select: {
          id: true,
          name: true,
          price: true,
          smallDescription: true,
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      });
      return {
        data: data,
        title: "Templates",
        link: "/products/template",
      };
    }
    case "uikits": {
      const data = await prisma.product.findMany({
        where: {
          category: "uikit",
        },
        select: {
          id: true,
          name: true,
          price: true,
          smallDescription: true,
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      });
      return {
        data: data,
        title: "UI Kits",
        link: "/products/uikit",
      };
    }
    default: {
      return notFound();
    }
  }
}

export function ProductRow({ category }: productProps) {
  return (
    <section className="mt-12">
      <Suspense fallback={<LoadingState />}>
        <LoadRows category={category} />
      </Suspense>
    </section>
  );
}

function LoadingState() {
  return (
    <div>
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-10 lg:grid-cols-3">
        <LoadingProductCard />
        <LoadingProductCard />
        <LoadingProductCard />
      </div>
    </div>
  );
}

async function LoadRows({ category }: productProps) {
  const data = await getData({ category: category });
  return (
    <>
      <div className="md:flex md:items-center md:justify-between">
        <h2 className="text-2xl font-extrabold tracking-tighter">
          {data.title}
        </h2>
        <Link
          href={data.link}
          className="text-sm hidden font-medium text-primary hover:text-primary/90 md:block"
        >
          All Products
          <span>&rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 mt-4 gap-10">
        {data.data.map((product) => {
          return (
            <>
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                images={product.images}
                price={product.price}
                smallDescription={product.smallDescription}
              />
            </>
          );
        })}
      </div>
    </>
  );
}
