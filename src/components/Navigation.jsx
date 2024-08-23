import { useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'

import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import { Tag } from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'
import { DonateButton } from '@/components/DonateButton'

function useInitialValue(value, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

function TopLevelNavItem({ href, children }) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="block py-1 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

function NavLink({
  href,
  tag,
  active,
  isAnchorLink = false,
  children,
  ...props
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pl-3 text-sm transition',
        isAnchorLink ? 'pr-7' : 'pr-4',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
    </Link>
  )
}

function VisibleSectionHighlight({ group, pathname }) {
  let [sections, visibleSections] = useInitialValue(
    [
      useSectionStore((s) => s.sections),
      useSectionStore((s) => s.visibleSections),
    ],
    useIsInsideMobileNavigation()
  )

  let isPresent = useIsPresent()
  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: '_top' }, ...sections].findIndex(
      (section) => section.id === visibleSections[0]
    )
  )
  let itemHeight = remToPx(2)
  let height = isPresent
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight
  let top =
    group.links.findIndex((link) => link.href === pathname) * itemHeight +
    firstVisibleSectionIndex * itemHeight

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height, top }}
    />
  )
}

function ActivePageMarker({ group, pathname }) {
  let itemHeight = remToPx(2)
  let offset = remToPx(0.25)
  let activePageIndex = group.links.findIndex((link) => link.href === pathname)
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute right-2 h-6 w-px bg-purple-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({ group, className }) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [router, sections] = useInitialValue(
    [useRouter(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation
  )

  let isActiveGroup =
    group.links.findIndex((link) => link.href === router.pathname) !== -1

  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.h2
        layout="position"
        className="text-xs font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pr-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && (
            <VisibleSectionHighlight group={group} pathname={router.pathname} />
          )}
        </AnimatePresence>
        <motion.div
          layout
          className="absolute inset-y-0 right-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker group={group} pathname={router.pathname} />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLink href={link.href} active={link.href === router.pathname}>
                {link.title}
              </NavLink>
              <AnimatePresence mode="popLayout" initial={false}>
                {link.href === router.pathname && sections.length > 0 && (
                  <motion.ul
                    role="list"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.1 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15 },
                    }}
                  >
                    {sections.map((section) => (
                      <li key={section.id}>
                        <NavLink
                          href={`${link.href}#${section.id}`}
                          tag={section.tag}
                          isAnchorLink
                        >
                          {section.title}
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  )
}

// single navigation Item without child
function NavigationSingle({ item, className }) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [router, sections] = useInitialValue(
    [useRouter(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation
  )

  let active = item.href === router.pathname

  return (
    <h2
      layout="position"
      className="text-xs mt-2 font-semibold text-zinc-900 dark:text-white"
    >
      <Link
        href={`${item.href}`}
        aria-current={active ? 'page' : undefined}
        className={clsx(
          'flex justify-between gap-2 py-1 pl-3 text-sm transition',
          active
            ? 'text-zinc-900 dark:text-white'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
        )}
      >
        <span className="truncate">{item.title}</span>
      </Link>
    </h2>
  )
}
export const navigation = [
  {
    title: 'اصول اولیه',
    href: '/fundamentals/',
  },
  {
    title: 'مقدمه',
    href: '/introduction/',
  },
  {
    title: 'چرا',
    links: [
      { title: 'استانداردها', href: '/why/standard/' },
      { title: 'شرایط و ضوابط', href: '/why/terms/' },
      { title: 'شیوه‌های داده', href: '/why/data-practices/' },
      { title: 'حفاظت از داده‌ها', href: '/why/data-protection/' },
      { title: 'استقلال', href: '/why/independence/' },
      { title: 'فناوری', href: '/why/technology/' },
      { title: 'سن', href: '/why/age/' },
    ],
  },
  {
    title: 'چرا نه ...',
    links: [
      {
        title: 'واتس‌اپ',
        href: '/whynot/whatsapp/',
        links: [
          {
            title: 'واتس‌اپ باز',
            href: '/whynot/whatsapp/openwhatsapp/',
            links: [
              { title: 'مقاله 01.06.2018', href: '/whynot/whatsapp/openwhatsapp/20180601/' },
              { title: 'نامه 06.06.2018', href: '/whynot/whatsapp/openwhatsapp/20180606/' },
              { title: 'مقاله 23.06.2018', href: '/whynot/whatsapp/openwhatsapp/20180623/' },
              { title: 'استعلام 12.07.2018', href: '/whynot/whatsapp/openwhatsapp/20180712/' },
              { title: 'پاسخ BMJV 03.09.2018', href: '/whynot/whatsapp/openwhatsapp/20180903/' },
            ],
          },
          {
            title: '#DeleteWhatsApp',
            href: '/whynot/whatsapp/deletewhatsapp/',
            links: [
              { title: 'مقاله 28.09.2018', href: '/whynot/whatsapp/deletewhatsapp/20180928/' },
            ],
          },
          {
            title: 'نظارت با واتس‌اپ',
            href: '/whynot/whatsapp/surveillance/',
          },
        ],
      },
      {
        title: 'سیگنال',
        href: '/whynot/signal/',
      },
      {
        title: 'استش‌کت / ابر.مدرسه',
        href: '/whynot/stashcat/',
      },
    ],
  },
  {
    title: 'اسرار ...',
    links: [
      { title: 'نگه‌دارندگان اسرار', href: '/secrets/confidants/' },
      { title: 'شماره‌های محرمانه', href: '/secrets/secret-numbers/' },
      { title: 'حریم خصوصی', href: '/secrets/privacy/' },
    ],
  },
  {
    title: 'آموزش و پرورش',
    links: [
      { title: 'چک‌لیست برای معرفی', href: '/education/introduction/' },
      { title: 'حوزه‌های موضوعی', href: '/education/topics/' },
      { title: 'مدارک', href: '/education/documents/' },
      { title: 'مقدمه‌ای بر پیام‌رسان‌های غیر آزاد', href: '/education/non-free-messengers-intro/' },
    ],
  },
  {
    title: 'پیام‌رسان - عمومی',
    links: [
      { title: 'توصیه', href: '/messenger-general/recommendation/' },
      { title: 'مدیریت / BOS / رسانه‌ها', href: '/messenger-general/administration/' },
      { title: 'کمک به تصمیم‌گیری', href: '/messenger-general/decision-aid/' },
      { title: 'مبنای تصمیم‌گیری', href: '/messenger-general/decision-basis/' },
      { title: 'مجوزها (اندروید)', href: '/messenger-general/permissions/' },
      { title: 'منابع برنامه (اندروید)', href: '/messenger-general/app-sources/' },
      { title: 'اضطراری', href: '/messenger-general/emergency/' },
      { title: 'مشکلات', href: '/messenger-general/problems/' },
      { title: 'افکار', href: '/messenger-general/thoughts/' },
    ],
  },
  {
    title: 'مقایسه سیستم‌ها',
    links: [
      { title: 'مقایسه XMPP/Matrix', href: '/system-comparison/xmpp-matrix/' },
      { title: 'مقایسه‌های پیام‌رسان', href: '/system-comparison/messenger-comparisons/' },
      {
        title: 'مقایسه Stiftung Warentest',
        href: '/system-comparison/stiftung-warentest/',
        links: [
          { title: 'نظر 22.02.2022 13:44', href: '/system-comparison/stiftung-warentest/202202221344/' },
          { title: 'نظر 22.02.2022 14:17', href: '/system-comparison/stiftung-warentest/202202221417/' },
          { title: 'نکات انتقادی 24.02.2022', href: '/system-comparison/stiftung-warentest/20220224_02/' },
          { title: 'نظر 24.02.2022', href: '/system-comparison/stiftung-warentest/20220224_01/' },
        ],
      },
      { title: 'پیام‌رسان‌های تیمی', href: '/system-comparison/team-messengers/' },
    ],
  },
  {
    title: '= = = مبتنی بر سرور = = =',
    href: '/server-based/',
  },
  {
    title: 'استاندارد چت (XMPP)',
    links: [
      { title: 'حساب چت', href: '/chat-standard-xmpp/account/' },
      { title: 'سرور', href: '/chat-standard-xmpp/server/' },
      { title: 'استفاده بهینه از چت', href: '/chat-standard-xmpp/optimal-use/' },
      { title: 'چت‌های عمومی', href: '/chat-standard-xmpp/public-chats/' },
      { title: 'اپل و جببر', href: '/chat-standard-xmpp/apple-jabber/' },
      { title: 'aTalk (اندروید)', href: '/chat-standard-xmpp/atalk/' },
      { title: 'Monal (iOS/MacOS)', href: '/chat-standard-xmpp/monal/' },
      { title: 'Chatsecure (iOS)', href: '/chat-standard-xmpp/chatsecure/' },
      { title: 'Conversations (اندروید)', href: '/chat-standard-xmpp/conversations/' },
      { title: 'Siskin (iOS)', href: '/chat-standard-xmpp/siskin/' },
      { title: 'Gajim (لینوکس/ویندوز)', href: '/chat-standard-xmpp/gajim/' },
      { title: 'اضافات', href: '/chat-standard-xmpp/extras/' },
    ],
  },
  {
    title: 'ماتریکس',
    links: [
      { title: 'Riot/RiotX', href: '/matrix/riot/' },
      { title: 'المنت', href: '/matrix/element/' },
      { title: 'افکار', href: '/matrix/thoughts/' },
    ],
  },
  {
    title: 'SimpleX',
    href: '/simplex/',
  },
  {
    title: 'چت ایمیل',
    href: '/email-chat/',
  },
  {
    title: '= = = مبتنی بر سرور = = =',
    href: '/server-supported/',
  },
  {
    title: 'اکو / گلدباگ / دود',
    href: '/echo-goldbug-smoke/',
  },
  {
    title: 'اسکاتل‌بات',
    href: '/scuttlebutt/',
  },
  {
    title: '= = = بدون سرور = = =',
    href: '/serverless/',
  },
  {
    title: 'بریار',
    href: '/briar/',
  },
  {
    title: 'پیام‌رسان شبکه محلی',
    href: '/lan-messenger/',
  },
  {
    title: '- - - - - - سایر - - - - - -',
    href: '/miscellaneous/',
  },
  {
    title: 'اصطلاحات',
    links: [
      { title: 'تعامل‌پذیری', href: '/terms/interoperability/', links: [
        { title: 'افکار', href: '/terms/interoperability/thoughts/' },
        { title: 'قانون بازارهای دیجیتال (DMA)', href: '/terms/interoperability/dma/' },
      ] },
      { title: 'ساختارهای شبکه', href: '/terms/network-structures/' },
      { title: 'امنیت توهمی', href: '/terms/pseudo-security/' },
      { title: 'رمزنگاری', href: '/terms/encryption/', links: [
        { title: 'افکار', href: '/terms/encryption/thoughts/' },
      ] },
      { title: 'ناشناسی', href: '/terms/anonymity/' },
      { title: 'API', href: '/terms/api/' },
      { title: 'الکترون', href: '/terms/electron/' },
      { title: 'فلاتر', href: '/terms/flutter/' },
      { title: 'P2P/\'بدون سرور\'', href: '/terms/p2p/' },
      { title: 'اعلان فشاری', href: '/terms/push-notification/' },
      { title: 'WebRTC, STUN و TURN', href: '/terms/webrtc/' },
    ],
  },
  {
    title: 'ارجاعات',
    href: '/references/',
  },
  {
    title: 'قالب‌های متنی',
    links: [
      { title: 'قالب \'مطبوعات\'', href: '/text-templates/press/' },
      { title: 'قالب \'واتس‌اپ کسب‌وکار\'', href: '/text-templates/whatsapp-business/' },
      { title: 'قالب \'سیستم جزیره‌ای\'', href: '/text-templates/island-system/' },
      { title: 'قالب \'مدرسه عمومی\'', href: '/text-templates/public-school/' },
    ],
  },
  {
    title: 'تمام محتوا در یک صفحه',
    href: '/all-contents/',
  },
  {
    title: '- - - - - - داخلی - - - - - -',
    href: '/internal/',
  },
  {
    title: 'انگیزه و تشکر',
    href: '/motivation-and-thanks/',
  },
  {
    title: 'پشتیبانی',
    href: '/support/',
  },
  {
    title: 'تماس',
    href: '/contact/',
  },
  {
    title: 'حفاظت از داده‌ها',
    href: '/data-protection/',
  },
  {
    title: 'اثر انگشت',
    href: '/legal-notice/',
  },
]

export function Navigation(props) {
  return (
    <nav {...props}>
      <ul role="list">
        {navigation.map((group, groupIndex) =>
          group?.links?.length > 0 ? (
            <NavigationGroup
              key={group.title}
              group={group}
              className={groupIndex === 0 && 'md:mt-0'}
            />
          ) : (
            <NavigationSingle
              key={group.title}
              item={group}
              className={groupIndex === 0 && 'md:mt-0'}
            />
          )
        )}
      </ul>
    </nav>
  )
}
