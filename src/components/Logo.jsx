import Image from 'next/image'

export function Logo(props) {
  return (
    <span className="font-display flex w-full flex-row items-center text-xl font-bold text-slate-900 dark:text-zinc-100 md:items-baseline md:text-2xl">
      {/* <Image
        src="/images/webp/nostrich-150.webp"
        className="mr-4 w-10 md:w-12"
        width="40"
        height="40"
        alt="Nostr.how"
      /> */}
      <span className="gradientText leading-loose	tracking-tight text-center w-full">
        پیامرسان.ویکی
      </span>
    </span>
  )
}
