import React from 'react';
import { SUBSCRIPTION_PLANS } from '../../config/subscriptionPlans';
import { useSubscription } from '../../hooks/useSubscription';

const SubscriptionCard: React.FC = () => {
  const { subscription, loading, error } = useSubscription();

  if (loading) return <div>Loading subscription...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!subscription) return <div>No subscription data</div>;

  const isExpired = subscription.expires_at && new Date(subscription.expires_at) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {subscription.plan.name} Plan
          </h3>
          <p className="text-gray-600">
            ${subscription.plan.price}/month
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">API Credits</p>
          <p className="text-lg font-semibold">
            {subscription.api_credits === -1 ? 'Unlimited' : subscription.api_credits}
          </p>
        </div>
      </div>

      {subscription.expires_at && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {isExpired ? 'Expired on' : 'Expires on'}: {' '}
            <span className={isExpired ? 'text-red-600' : 'text-green-600'}>
              {new Date(subscription.expires_at).toLocaleDateString()}
            </span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Features:</h4>
        <ul className="space-y-1">
          {subscription.plan.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionCard;