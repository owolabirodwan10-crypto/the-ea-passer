import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Wallet, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DeveloperPayoutsPage() {
  const user = await getCurrentUser()

  // Redirect if not logged in
  if (!user) {
    redirect('/login')
  }

  const developer = await prisma.developer.findUnique({
    where: { userId: user.id },
  })

  if (!developer) {
    return (
      <div className="container-custom py-12">
        <div className="card p-12 text-center max-w-2xl mx-auto">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Not a Developer Yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You need to be approved as a developer to access payouts.
          </p>
          <Link href="/developer/overview" className="btn-primary">
            Apply Now
          </Link>
        </div>
      </div>
    )
  }

  // Only proceed if developer exists
  const payouts = await prisma.payout.findMany({
    where: { developerId: developer.id },
    orderBy: { createdAt: 'desc' },
  })

  // ... rest of your payouts page logic
}