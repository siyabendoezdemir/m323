import rawData from '../public/employment-data.json'

class DataProcessor {
    constructor() {
        this.rawData = rawData
        this.processedData = this.processData()
    }

    processData() {
        const { dataset } = this.rawData
        const { Grossregion, Wirtschaftssektor, Geschlecht, Quartal } = dataset.dimension

        return {
            regions: this.processCategory(Grossregion.category),
            sectors: this.processCategory(Wirtschaftssektor.category),
            genders: this.processCategory(Geschlecht.category),
            quarters: this.processCategory(Quartal.category),
            employmentData: dataset.value,
            dimensions: {
                regionsCount: Object.keys(Grossregion.category.index).length,
                sectorsCount: Object.keys(Wirtschaftssektor.category.index).length,
                gendersCount: Object.keys(Geschlecht.category.index).length,
                quartersCount: Object.keys(Quartal.category.index).length
            }
        }
    }

    processCategory(category) {
        const result = []
        for (let id in category.index) {
            result.push({
                id: id,
                label: category.label[id],
                index: parseInt(category.index[id])
            })
        }
        result.sort(function(a, b) {
            return a.index - b.index
        })
        return result
    }

    getIndex(regionId, sectorId, genderId, quarterId) {
        const { Grossregion, Wirtschaftssektor, Geschlecht, Quartal } = this.rawData.dataset.dimension
        const { sectorsCount, gendersCount, quartersCount } = this.processedData.dimensions

        const regionIndex = parseInt(Grossregion.category.index[regionId])
        const sectorIndex = parseInt(Wirtschaftssektor.category.index[sectorId])
        const genderIndex = parseInt(Geschlecht.category.index[genderId])
        const quarterIndex = parseInt(Quartal.category.index[quarterId])

        return (
            regionIndex * sectorsCount * gendersCount * quartersCount +
            sectorIndex * gendersCount * quartersCount +
            genderIndex * quartersCount +
            quarterIndex
        )
    }

    getRegions() {
        return this.processedData.regions
    }

    getSectors() {
        return this.processedData.sectors
    }

    getQuarters() {
        return this.processedData.quarters
    }

    getGenderDistribution(regionId, sectorId, quarterId) {
        const maleIndex = this.getIndex(regionId, sectorId, "1", quarterId)
        const femaleIndex = this.getIndex(regionId, sectorId, "2", quarterId)

        const maleValue = this.processedData.employmentData[maleIndex] || 0
        const femaleValue = this.processedData.employmentData[femaleIndex] || 0

        const total = maleValue + femaleValue

        let malePercentage = '0.0'
        let femalePercentage = '0.0'

        if (total > 0) {
            malePercentage = (maleValue / total * 100).toFixed(1)
            femalePercentage = (femaleValue / total * 100).toFixed(1)
        }

        return {
            male: maleValue,
            female: femaleValue,
            malePercentage: malePercentage,
            femalePercentage: femalePercentage,
            total: total
        }
    }

    getGenderTrend(regionId, sectorId) {
        const trend = []
        for (let i = 0; i < this.processedData.quarters.length; i++) {
            const quarter = this.processedData.quarters[i]
            const distribution = this.getGenderDistribution(regionId, sectorId, quarter.id)
            trend.push({
                quarter: quarter.label,
                male: distribution.male,
                female: distribution.female,
                malePercentage: distribution.malePercentage,
                femalePercentage: distribution.femalePercentage
            })
        }
        return trend
    }

    getSectorComparison(regionId, quarterId) {
        const comparison = []
        for (let i = 0; i < this.processedData.sectors.length; i++) {
            const sector = this.processedData.sectors[i]
            if (sector.id !== 'TOT') {
                const distribution = this.getGenderDistribution(regionId, sector.id, quarterId)
                comparison.push({
                    sector: sector.label,
                    malePercentage: distribution.malePercentage,
                    femalePercentage: distribution.femalePercentage,
                    total: distribution.total
                })
            }
        }
        return comparison
    }

    getLatestQuarter() {
        return this.processedData.quarters[this.processedData.quarters.length - 1].id
    }

    testDataPoint() {
        const distribution = this.getGenderDistribution("0", "3", "2024Q2")
        console.log("Test Data Point (Schweiz, Sektor 3, 2024Q2):")
        console.log("Männer: " + distribution.male + " (" + distribution.malePercentage + "%)")
        console.log("Frauen: " + distribution.female + " (" + distribution.femalePercentage + "%)")
        console.log("Total: " + distribution.total)
    }
}

const dataProcessor = new DataProcessor()
dataProcessor.testDataPoint()
export default dataProcessor