// Test ID: IIDSAT
import { getOrder } from '../../services/apiRestaurant';
import { useFetcher, useLoaderData } from 'react-router-dom';
import OrderItem from './OrderItem';
import {
  calcMinutesLeft,
  formatCurrency,
  formatDate,
} from '../../utils/helpers';
import { useEffect } from 'react';
import UpdateOrder from './UpdateOrder';

function Order() {
  const order = useLoaderData();

  const fetcher = useFetcher();

  useEffect(
    function () {
      if (!fetcher.data && fetcher.state === 'idle') fetcher.load('/menu');
    },
    [fetcher],
  );

  // Everyone can search for all orders, so for privacy reasons we're gonna gonna exclude names or address, these are only for the restaurant staff
  const {
    id,
    status,
    priority,
    priorityPrice,
    orderPrice,
    estimatedDelivery,
    cart,
  } = order;
  const deliveryIn = calcMinutesLeft(estimatedDelivery);

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Order Header */}
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-stone-800">
                Order #{id}
              </h2>
              <p className="text-stone-600">Track your order status</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {priority && (
                <span className="badge-warning">⚡ Priority Order</span>
              )}
              <span className="badge-success">{status} order</span>
            </div>
          </div>
        </div>

        {/* Delivery Status */}
        <div className="card border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{deliveryIn >= 0 ? '🚚' : '✅'}</span>
              <div>
                <p className="text-lg font-semibold text-stone-800">
                  {deliveryIn >= 0
                    ? `Only ${calcMinutesLeft(estimatedDelivery)} minutes left 😃`
                    : 'Order should have arrived'}
                </p>
                <p className="text-sm text-stone-600">
                  Estimated delivery: {formatDate(estimatedDelivery)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card p-6">
          <h3 className="mb-4 text-xl font-bold text-stone-800">Order Items</h3>
          <div className="space-y-4">
            {cart.map((item) => (
              <OrderItem
                item={item}
                key={item.pizzaId}
                isLoadingIngredients={fetcher.state === 'loading'}
                ingredients={
                  fetcher?.data?.find((el) => el.id === item.pizzaId)
                    ?.ingredients ?? []
                }
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card bg-gradient-to-r from-stone-50 to-stone-100 p-6">
          <h3 className="mb-4 text-xl font-bold text-stone-800">
            Order Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-stone-600">Pizza Total:</span>
              <span className="font-semibold">
                {formatCurrency(orderPrice)}
              </span>
            </div>
            {priority && (
              <div className="flex justify-between">
                <span className="text-stone-600">Priority Fee:</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(priorityPrice)}
                </span>
              </div>
            )}
            <div className="border-t border-stone-200 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-bold">
                  Total to pay on delivery:
                </span>
                <span className="text-gradient text-lg font-bold">
                  {formatCurrency(orderPrice + priorityPrice)}
                </span>
              </div>
            </div>

            {!priority && <UpdateOrder order={order} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function loader({ params }) {
  const order = await getOrder(params.orderID);
  return order;
}

export default Order;
