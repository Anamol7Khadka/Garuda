import React, { useState, useEffect } from 'react'
import { Users, TrendingUp, DollarSign, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">प्रशासक डैशबोर्ड</h1>
        <p className="text-gray-600 mb-8">सेवासाथी प्लेटफर्म अवलोकन</p>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <Users className="text-blue-700" size={32} />
              </div>
              <div>
                <p className="text-gray-600">कुल प्रयोगकर्ताहरू</p>
                <p className="text-3xl font-bold text-gray-800">1,250</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <TrendingUp className="text-green-700" size={32} />
              </div>
              <div>
                <p className="text-gray-600">सक्रिय प्रदान गर्नेहरू</p>
                <p className="text-3xl font-bold text-gray-800">450</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-4 rounded-lg">
                <DollarSign className="text-yellow-700" size={32} />
              </div>
              <div>
                <p className="text-gray-600">कुल लेनदेन</p>
                <p className="text-3xl font-bold text-gray-800">₨45.2L</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-300 p-4 rounded-lg">
                <CheckCircle className="text-purple-600" size={32} />
              </div>
              <div>
                <p className="text-gray-600">पूरा भएका कामहरू</p>
                <p className="text-3xl font-bold text-gray-800">2,350</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Verification Pending */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">सत्यापन प्रतीक्षमा</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <p className="font-semibold">राज कुमार शर्मा</p>
                <p className="text-sm text-gray-600">Email: raj@example.com</p>
                <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                  सत्यापन गर्नुहोस्
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <p className="font-semibold">प्रिया पौडेल</p>
                <p className="text-sm text-gray-600">Email: priya@example.com</p>
                <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                  सत्यापन गर्नुहोस्
                </button>
              </div>
            </div>
          </div>

          {/* Featured Providers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">महिला प्रदान गर्नेहरूलाई फिचर गर्नुहोस्</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p className="font-semibold">अनिता पौडेल</p>
                <p className="text-sm text-gray-600">सफाई सेवा | रेटिङ: 4.9</p>
                <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600/90">
                  फिचर गर्नुहोस्
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <p className="font-semibold">राधा सिंह</p>
                <p className="text-sm text-gray-600">सौन्दर्य सेवा | रेटिङ: 4.8</p>
                <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600/90">
                  फिचर गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">हालका बुकिङहरू</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">बुकिङ आईडी</th>
                  <th className="px-4 py-3 text-left font-semibold">ग्राहक</th>
                  <th className="px-4 py-3 text-left font-semibold">सेवा</th>
                  <th className="px-4 py-3 text-left font-semibold">स्थिति</th>
                  <th className="px-4 py-3 text-left font-semibold">मूल्य</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">#{1000 + i}</td>
                    <td className="px-4 py-3">ग्राहक {i + 1}</td>
                    <td className="px-4 py-3">प्लम्बिङ सेवा</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        पूरा
                      </span>
                    </td>
                    <td className="px-4 py-3">₨{500 + i * 100}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
